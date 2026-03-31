import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

df = pd.read_csv('nagpur_aqi.csv')
df = df.dropna(subset=['AQI'])

df['Date'] = pd.to_datetime(df['Date'])
df['month'] = df['Date'].dt.month
df['day_of_week'] = df['Date'].dt.dayofweek
df['is_crop_season'] = df['month'].isin([10, 11]).astype(int)
df['is_festival'] = df['month'].isin([10, 11]).astype(int)

features = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'month', 'day_of_week', 'is_crop_season', 'is_festival']
df = df.dropna(subset=features)

X = df[features]
y = df['AQI']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"MAE: {mean_absolute_error(y_test, preds):.2f}")
print(f"R2:  {r2_score(y_test, preds):.2f}")

joblib.dump(model, 'model.pkl')
print("model.pkl saved!")