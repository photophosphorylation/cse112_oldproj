import sys
import cPickle as pkl

args = sys.argv[1:]

exm = []
exm.append(int(args[0]))

exm.append(int(args[1]))

dayRes = [0 for i in range(7)]

dayRes[int(args[2])] = 1
exm.extend(dayRes)

exm.append(int(args[3]))
exm.append(int(args[4]))

reg = pkl.load(open('ml/model.pkl'))
prob = reg.predict_proba([exm])
print(prob[0][1])
