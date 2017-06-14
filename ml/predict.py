import sys
import cPickle as pkl

def predict(args):

   days = ['Sunday',
           'Monday',
           'Tuesday',
           'Wednesday',
           'Thursday',
           'Friday',
           'Saturday']

   exm = []
   exm.append(int(args[0]))

   if args[1] == 'M':
      exm.append(1)
   else:
      exm.append(0)

   dayRes = [0 for i in range(len(days))]
   dayRes[days.index(args[2])] = 1
   exm.extend(dayRes)

   exm.append(0)
   exm.append(int(args[3]))

   exm1 = list(exm)
   exm1[-2] = 1

   reg = pkl.load(open('model.pkl'))
   prob0 = reg.predict_proba([exm])
   prob1 = reg.predict_proba([exm1])

   print(prob0[0][1])
   print(prob1[0][1])

if __name__ == '__main__':
   args = sys.argv[1:]
   args[0] = int(args[0])
   args[-1] = int(args[-1])

   predict(args)
