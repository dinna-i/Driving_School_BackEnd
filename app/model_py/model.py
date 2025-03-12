import pandas as pd;
from sklearn.ensemble import RandomForestRegressor; 
from sklearn.model_selection import train_test_split;
from sklearn.metrics import mean_absolute_error;
from sklearn.metrics import mean_squared_error;
from sklearn.metrics import r2_score;
from sklearn.preprocessing import LabelEncoder;


df=pd.read_csv("D:\\SLIIT\\Y3\\S2\\DS\\huge_student_participation_dataset.csv")
df

df.drop_duplicates(inplace=True)

df['Time'] = pd.to_datetime(df['Time'], format='%H:%M').dt.hour


encoder = LabelEncoder()
df['Weather'] = encoder.fit_transform(df['Weather'])

X=df.drop(columns=['Participants'])
y=df['Participants']
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2)



model=RandomForestRegressor()
model.fit(X_train,y_train)
predictions=model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)


print(f'Mean Absolute Error: {mae}')
print(f'Mean Squared Error: {mse}')
print(f'R2 Score: {r2}')