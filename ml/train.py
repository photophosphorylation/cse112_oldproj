import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import cPickle as pkl

def train_model(c):
   reg = LogisticRegression(C=c)

   X_train = np.load('X_train.npy')
   Y_train = np.load('Y_train.npy')
   X_test = np.load('X_test.npy')
   Y_test = np.load('Y_test.npy')

   reg.fit(X_train, Y_train)

   pred = reg.predict(X_test)
   _, counts = np.unique(pred, return_counts=True)
   print(counts)
   acc = accuracy_score(pred, Y_test)

   print(acc)

   pkl.dump(reg, open('model.pkl', 'wb'), -1)

if __name__ == '__main__':
   c = float(raw_input('c: '))
   train_model(c)
