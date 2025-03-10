import pickle;
import pandas as pd;
from sklearn.ensemble import RandomForestRegressor;
from sklearn.model_selection import train_test_split;
from sklearn.metrics import accuracy_score;
from sklearn.preprocessing import LabelEncoder


df=pd.read_csv("D:\\SLIIT\\Y3\\S2\\DS\\huge_driving_school_participants.csv")
df

df.drop_duplicates(inplace=True)

if 'Time' in df.columns:
    df['Time'] = pd.to_datetime(df['Time'], format='%H:%M').dt.hour * 60 + pd.to_datetime(df['Time'], format='%H:%M').dt.minute

encoder = LabelEncoder()
df['Session_Type'] = encoder.fit_transform(df['Session_Type'])


X=df.drop(columns=['Participants','Date','Instructor'])
y=df['Participants']
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2)


model=RandomForestRegressor(max_depth=15,random_state=100)
model.fit(X_train,y_train)
predictions=model.predict(X_test)

score=accuracy_score(y_test,predictions)
X