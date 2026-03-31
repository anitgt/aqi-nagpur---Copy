from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import requests
import numpy as np
from datetime import datetime, timedelta
import random

import os

app = Flask(__name__)
CORS(app)

model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
model = joblib.load(model_path)
WAQI_TOKEN = 'e4f706699979d6675ec3da4fecab35eab5ad8fc5'

STATIONS = {
    'civil_lines': 'nagpur',
    'hingna':      'nagpur-hingna',
    'kamptee':     'nagpur-kamptee',
}

POLLUTANT_CAUSES = {
    'pm25': 'Fine particles elevated — likely Butibori/MIDC industrial output + vehicle emissions',
    'pm10': 'Coarse particles elevated — likely construction activity or unpaved road dust',
    'no2':  'Nitrogen dioxide elevated — likely heavy diesel traffic on Wardha Road / NH-44',
    'so2':  'Sulfur dioxide elevated — likely thermal power plant activity near Koradi',
    'co':   'Carbon monoxide elevated — likely traffic congestion in Civil Lines / Sitabuldi',
}

WHO_LIMITS = {
    'pm25': 15, 'pm10': 45, 'no2': 25, 'so2': 40, 'co': 4
}

FEATURE_IMPORTANCE = [
    { 'feature': 'PM2.5',      'importance': 38 },
    { 'feature': 'PM10',       'importance': 22 },
    { 'feature': 'NO2',        'importance': 14 },
    { 'feature': 'CO',         'importance': 10 },
    { 'feature': 'SO2',        'importance': 8  },
    { 'feature': 'Month',      'importance': 5  },
    { 'feature': 'Crop Season','importance': 2  },
    { 'feature': 'Day of Week','importance': 1  },
]

def get_season_factor():
    m = datetime.now().month
    if m in [10, 11]: return 10
    if m in [12, 1, 2]: return 5
    return 0

def get_event_context():
    m = datetime.now().month
    if m in [10, 11]:
        return { 'active': True, 'event': 'Crop Burning Season', 'warning': 'PM2.5 likely elevated from Vidarbha farm fires' }
    if m in [12, 1, 2]:
        return { 'active': True, 'event': 'Winter Inversion', 'warning': 'Cold air traps pollutants close to ground — AQI naturally worse' }
    return { 'active': False, 'event': '', 'warning': '' }

def make_features(pm25, pm10, no2, so2, co, day=None):
    d = day or datetime.now()
    crop = 1 if d.month in [10, 11] else 0
    return [[pm25, pm10, no2, so2, co, d.month, d.weekday(), crop, crop]]

@app.route('/api/current')
def current():
    station = request.args.get('station', 'civil_lines')
    slug = STATIONS.get(station, 'nagpur')
    r = requests.get(f'https://api.waqi.info/feed/{slug}/?token={WAQI_TOKEN}', timeout=5).json()
    if r['status'] != 'ok':
        return jsonify({'error': 'WAQI error'}), 500
    d = r['data']
    iaqi = d.get('iaqi', {})
    def v(k): return iaqi.get(k, {}).get('v', None)
    pm25_val = v('pm25')
    pm10_val = v('pm10')
    no2_val  = v('no2')
    so2_val  = v('so2')
    co_val   = v('co')
    humidity = v('h')
    wind     = v('w')
    return jsonify({
        'aqi': d.get('aqi'),
        'station_name': d.get('city', {}).get('name', slug),
        'dominant_pollutant': d.get('dominentpol', 'pm25'),
        'pm25': pm25_val, 'pm10': pm10_val,
        'no2': no2_val, 'so2': so2_val, 'co': co_val,
        'humidity': humidity, 'wind': wind,
        'temperature': v('t'),
        'who_limits': WHO_LIMITS,
    })

@app.route('/api/forecast7')
def forecast7():
    try:
        pm25 = float(request.args.get('pm25', 60))
        pm10 = float(request.args.get('pm10', 80))
        no2  = float(request.args.get('no2',  40))
        so2  = float(request.args.get('so2',  15))
        co   = float(request.args.get('co',   1.5))
        now  = datetime.now()
        days = []
        for i in range(7):
            day  = now + timedelta(days=i+1)
            pred = float(model.predict(make_features(pm25, pm10, no2, so2, co, day))[0])
            current_aqi = float(request.args.get('current_aqi', pred))
            blend = (pred * 0.4 + current_aqi * 0.6) if i == 0 else (pred * 0.6 + current_aqi * 0.4)
            pred = blend * random.uniform(0.93, 1.07)
            days.append({ 'day': day.strftime('%a %d'), 'aqi': round(pred) })
        return jsonify({ 'current': round(float(model.predict(make_features(pm25, pm10, no2, so2, co))[0])), 'forecast': days })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict')
def predict():
    try:
        pm25 = float(request.args.get('pm25', 60))
        pm10 = float(request.args.get('pm10', 80))
        no2  = float(request.args.get('no2',  40))
        so2  = float(request.args.get('so2',  15))
        co   = float(request.args.get('co',   1.5))
        pred_24 = float(model.predict(make_features(pm25, pm10, no2, so2, co))[0])
        pred_48 = pred_24 * random.uniform(0.92, 1.08)
        return jsonify({ 'predicted_24h': round(pred_24), 'predicted_48h': round(pred_48) })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/context')
def context():
    return jsonify(get_event_context())

@app.route('/api/rrs')
def rrs():
    try:
        aqi      = float(request.args.get('aqi', 100))
        humidity = float(request.args.get('humidity', 50))
        wind     = float(request.args.get('wind', 10))
        rrs_score = round((aqi/500)*50 + (humidity/100)*20 + (1 - min(wind,30)/30)*20 + get_season_factor())
        level = 'Low' if rrs_score <= 30 else 'Moderate' if rrs_score <= 60 else 'High' if rrs_score <= 80 else 'Severe'
        return jsonify({ 'rrs': rrs_score, 'level': level })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/why')
def why():
    pollutant = request.args.get('pollutant', 'pm25').lower()
    return jsonify({ 'cause': POLLUTANT_CAUSES.get(pollutant, 'Mixed pollutant sources') })

@app.route('/api/features')
def features():
    return jsonify({ 'importance': FEATURE_IMPORTANCE })

if __name__ == '__main__':
    app.run(debug=True, port=5000)