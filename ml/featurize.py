import numpy as np
import csv
from sklearn.model_selection import train_test_split

def featurize():

   days = ['Sunday',
           'Monday',
           'Tuesday',
           'Wednesday',
           'Thursday',
           'Friday',
           'Saturday']

   # load in the data
   reader = csv.reader(open('No-show-Issue-Comma-300k.csv'))
   header = reader.next()
   data = []
   for row in reader:
      data.append(row)
   data = np.asarray(data)

   # slice off medical features
   age = header.index('Age')
   gender = header.index('Gender')
   day = header.index('DayOfTheWeek')
   status = header.index('Status')
   sms = header.index('Sms_Reminder')
   wait = header.index('AwaitingTime')
   raw = data[:,[age, gender, day, sms, wait, status]]

   X = []
   Y = []
   for exmr in raw:
      exm = []
      exm.append(int(exmr[0]))

      if exmr[1] == 'M':
         exm.append(1)
      else:
         exm.append(0)

      dayRes = [0 for i in range(len(days))]
      dayRes[days.index(exmr[2])] = 1
      exm.extend(dayRes)

      exm.append(int(exmr[3]))

      exm.append(-int(exmr[4]))

      X.append(exm)
      if exmr[5] == "Show-Up":
         Y.append(1)
      else:
         Y.append(0)

   X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size = 0.2)

   np.save('X_train', X_train)
   np.save('X_test', X_test)
   np.save('Y_train', Y_train)
   np.save('Y_test', Y_test)

if __name__ == '__main__':
   featurize()
