from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler, MinMaxScaler, MaxAbsScaler
from sklearn.metrics import accuracy_score

def load_data(train_size=0.8):
    wine=load_wine()
    X,y=wine.data, wine.target
    X_train, X_test, y_train, y_test = train_test_split(X[:, :2], y, train_size=train_size, random_state=42)
    return X_train, X_test, y_train, y_test

def train_model(X_train, y_train, n_neighbors=15, weights='uniform'):
    return (KNeighborsClassifier(n_neighbors=n_neighbors, weights=weights)).fit(X_train, y_train)

def predict(clf, X_test):
    return clf.predict(X_test)

def estimate(res, y_test):
    return round(accuracy_score(y_true=y_test, y_pred=res), 3)

def scale(X, mode='standard'):
    if mode not in ['standard', 'minmax', 'maxabs']: return None
    scaler = StandardScaler()
    if mode == 'minmax': scaler = MinMaxScaler()
    elif mode == 'maxabs': scaler = MaxAbsScaler()
    scaler = scaler.fit(X)
    x_scaled = scaler.transform(X)
    return x_scaled