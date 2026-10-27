// Topic: Classification with logistic regression, loss and gradient descent. A COMPLETE topic.
// Starts from zero: intuition and pictures first, then the small amount of maths, then code.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const mlClassificationGradientDescent: Topic = {
  id: "ml-classification-gradient-descent",
  domainId: "",
  moduleId: "",
  title: "How a model learns: classification, loss and gradient descent",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Explain features, labels, a model's parameters and a prediction, using a tiny example.",
    "Explain what a loss function measures and how gradient descent uses it to adjust parameters step by step.",
    "Describe the effect of the learning rate (too small, too large) and recognise when training has converged.",
    "Explain what a decision boundary is and why accuracy alone can be misleading for classification.",
  ],
  prerequisites: ["ml-what-is-ml"],
  subtopics: ["Features and labels", "Weights and bias", "The sigmoid function", "Log loss (cross-entropy)", "Gradients", "Learning rate", "Convergence", "Decision boundaries", "Training vs test data"],
  strikeIds: [],

  story:
    "A support team wants to flag tickets likely to escalate, so seniors can jump in early. Writing rules by hand ('if the word refund appears and…') keeps failing. Instead, you can show a model thousands of past tickets with the outcome attached and let it find the pattern. But what does 'let it learn' actually mean? It means: guess, measure how wrong the guess was, nudge the numbers, repeat.",
  mentalModel: {
    plain:
      "A model is a formula with adjustable numbers (parameters). Training is a loop: make predictions on examples whose answers you know, compute one number that says how wrong you were (the loss), work out which direction to nudge each parameter to make the loss smaller (the gradient), take a small step that way, and repeat thousands of times.",
    analogy:
      "Walking downhill in fog. You cannot see the valley, but you can feel which way the ground slopes under your feet. Take a step downhill, feel again, step again. The height of the ground is the loss, the slope is the gradient, and your step size is the learning rate.",
    analogyLimit:
      "Real loss landscapes for neural networks have millions of dimensions, plateaus and many valleys, so 'downhill' does not guarantee the best possible valley. For logistic regression (this topic), though, the landscape really is one smooth bowl, so walking downhill does find the bottom.",
  },
  lessonSections: [
    {
      heading: "1. Rules vs learning",
      body:
        "Traditional programming: you write the rules, the computer applies them to data to produce answers. Machine learning: you provide data AND the answers (labels), and an algorithm produces the rules (a trained model), which you then apply to new data.",
    },
    {
      heading: "2. Features, labels and parameters",
      body:
        "Example: predict whether a student passes (label: 1 or 0) from hours studied (feature). The model is `chance = sigmoid(w × hours + b)`. `w` (weight) and `b` (bias) are the parameters that training adjusts. The sigmoid squashes any number into the range 0 to 1, so the output can be read as a probability.",
    },
    {
      heading: "3. Loss: one number for 'how wrong'",
      body:
        "For yes/no predictions we use log loss (cross-entropy). If the true label is 1 and the model says 0.9, the loss is small (−log 0.9 ≈ 0.11). If it says 0.1, the loss is large (−log 0.1 ≈ 2.3). Confident wrong answers are punished hard. We average this over all examples.\n\nA model that always says 0.5 has loss ≈ 0.693 (that is ln 2), which is why training starts there when w and b are 0.",
    },
    {
      heading: "4. Gradient descent: follow the slope",
      body:
        "The gradient tells us, for each parameter, how the loss changes if we nudge it up a little. For logistic regression it works out neatly: for each example, (prediction − label) × feature for w, and (prediction − label) for b, averaged. We subtract learning rate × gradient from each parameter. Repeat.",
    },
    {
      heading: "5. Learning rate and convergence",
      body:
        "Too small a learning rate: training crawls. Too large: steps overshoot the bottom, the loss jumps around or grows. Training has converged when the loss stops improving. In the example below it reaches 0.313 by epoch 1000 and stays there. It does not reach 0, because one student who studied 2.5 hours failed while one who studied 2 hours passed: real data is noisy.",
    },
    {
      heading: "6. The decision boundary, and why accuracy can lie",
      body:
        "We predict 'pass' when the chance is above 0.5. That happens where w × hours + b = 0, i.e. at hours = −b / w: the decision boundary. With two features the boundary is a line; with many it is a flat surface.\n\nAccuracy (share of correct predictions) can mislead when classes are imbalanced: if 99% of transactions are legitimate, a model that always says 'legitimate' is 99% accurate and catches zero fraud. Precision and recall (next topics) fix that.",
    },
    {
      heading: "7. Never grade on the homework",
      body:
        "A model can memorise its training examples. To know how it does on NEW data, hold some labelled examples back (a test set) and evaluate only on those, after all training and tuning decisions are made.",
    },
  ],
  visualizationType: "decision-boundary",
  codeExamples: [
    {
      title: "Training logistic regression from scratch with gradient descent",
      language: "js",
      code: `// Hours studied -> passed the exam (1) or not (0)
const hours = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
const passed = [0, 0, 0, 1, 0, 1, 1, 1];

const sigmoid = (z) => 1 / (1 + Math.exp(-z));
let w = 0; // weight: how much each hour matters
let b = 0; // bias: where the boundary sits
const learningRate = 0.5;

for (let epoch = 0; epoch <= 3000; epoch++) {
  let gradW = 0, gradB = 0, loss = 0;
  for (let i = 0; i < hours.length; i++) {
    const p = sigmoid(w * hours[i] + b); // predicted chance of passing
    gradW += (p - passed[i]) * hours[i];
    gradB += p - passed[i];
    loss += -(passed[i] * Math.log(p) + (1 - passed[i]) * Math.log(1 - p));
  }
  w -= (learningRate * gradW) / hours.length;
  b -= (learningRate * gradB) / hours.length;
  if (epoch % 1000 === 0) console.log(\`epoch \${epoch}: loss \${(loss / hours.length).toFixed(3)}\`);
}

console.log(\`decision boundary: \${(-b / w).toFixed(2)} hours\`);
console.log([1, 2.25, 3.5].map((h) => \`\${h}h -> \${sigmoid(w * h + b).toFixed(2)}\`).join(", "));`,
      expectedOutput: `epoch 0: loss 0.693
epoch 1000: loss 0.313
epoch 2000: loss 0.313
epoch 3000: loss 0.313
decision boundary: 2.25 hours
1h -> 0.04, 2.25h -> 0.50, 3.5h -> 0.96`,
      steps: [
        "At epoch 0, w = b = 0, so every prediction is sigmoid(0) = 0.5 and the average loss is ln 2 ≈ 0.693.",
        "Each epoch computes the average gradient over all 8 examples and moves w and b a small step against it.",
        "By epoch 1000 the loss has dropped to 0.313 and stops improving: training has converged.",
        "The boundary −b/w lands at 2.25 hours, between the overlapping examples at 2 and 2.5 hours.",
        "At the boundary the model is exactly 50/50; far from it, it is confident (0.04 and 0.96).",
        "This output was produced by running the code with Node 22 while writing this lesson.",
      ],
    },
  ],
  practicalApplication:
    "Before reaching for a complex model or an AI API, try a simple baseline like logistic regression on a few well-chosen features. It trains in milliseconds, its weights are interpretable ('each extra hour multiplies the odds of passing by e^w'), and it gives you a benchmark: if a fancy model cannot beat it on a held-out test set, the fancy model is not worth its cost.",
  commonMistakes: [
    { mistake: "Evaluating on the training data.", symptom: "Great scores in development, poor results on real data.", fix: "Split off a test set before training; touch it only for final evaluation." },
    { mistake: "Learning rate too high.", symptom: "Loss bounces around or becomes NaN/Infinity.", fix: "Lower the learning rate (try dividing by 10) and plot the loss per epoch." },
    { mistake: "Features on wildly different scales (e.g. age in years and income in dollars).", symptom: "Very slow or unstable training.", fix: "Standardise features (subtract the mean, divide by the standard deviation) using statistics from the training set only." },
  ],
  misconceptions: [
    { myth: "Machine learning means the computer understands the problem.", truth: "It finds numeric patterns that reduce a loss on the examples it was given. It has no understanding beyond that, and it will happily learn shortcuts and biases present in the data." },
    { myth: "Lower training loss always means a better model.", truth: "A model can drive training loss down by memorising (overfitting). Only performance on held-out data shows generalisation." },
    { myth: "The 0.5 threshold is part of the model.", truth: "It is a separate decision. If missing a positive is costly (e.g. fraud), you might flag anything above 0.2." },
  ],
  exercises: [
    { kind: "lab", lab: "decision-boundary", task: "Place red and blue points on the canvas and train a real logistic regression on them. Change the learning rate and watch the boundary move as the loss falls.", goal: "Find a learning rate that converges in under 300 steps, and one that diverges. Note both values." },
    {
      kind: "predict",
      question: {
        id: "ml-classification-gradient-descent-p1",
        prompt: "In the example, what happens to the decision boundary if we relabel the student who studied 2 hours as 'failed' (0)?",
        choices: ["It stays at 2.25", "The data becomes perfectly separable; the boundary moves to between 2.5 and 3 and the weight keeps growing", "The loss becomes larger", "Training stops working"],
        answerIndex: 1,
        explanation: "Now every student up to 2.5 hours failed and every student from 3 hours passed, so a sharp boundary between 2.5 and 3 fits perfectly. Gradient descent then keeps increasing w to make predictions ever more confident, so the loss keeps creeping toward 0 and never truly converges, which is one reason regularisation is used.",
        objective: 1,
      },
    },
    {
      kind: "debug",
      question: {
        id: "ml-classification-gradient-descent-d1",
        prompt: "This training loop's loss grows every epoch. Which line is the bug?",
        code: `const p = sigmoid(w * x[i] + b);      // line 1
gradW += (p - y[i]) * x[i];            // line 2
w += learningRate * gradW / n;          // line 3`,
        choices: ["Line 1", "Line 2", "Line 3"],
        answerIndex: 2,
        explanation: "Gradient DESCENT subtracts the gradient. Adding it walks uphill, increasing the loss every step. It should be `w -= learningRate * gradW / n`.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    { id: "ml-classification-gradient-descent-k1", prompt: "In 'predict house price from size', what is the label?", choices: ["Size", "Price", "The model", "The learning rate"], answerIndex: 1, explanation: "The label is what we want to predict; size is a feature.", objective: 0 },
    { id: "ml-classification-gradient-descent-k2", prompt: "What does the gradient tell gradient descent?", choices: ["The final answer", "Which direction (and how steeply) the loss increases for each parameter", "How many epochs to run", "The test accuracy"], answerIndex: 1, explanation: "We step in the opposite direction to reduce the loss.", objective: 1 },
  ],
  project: {
    title: "Trained and evaluated classifier, from scratch and with a library",
    summary: "Train a logistic regression from scratch on a small public dataset (e.g. a binary subset of a well-known teaching dataset), compare it with a library implementation, and report honest test-set metrics.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "Load a small public, licensed dataset and document its source and licence.",
      "Split into train/test before any training; standardise features using train statistics only.",
      "Implement gradient descent yourself, plot loss per epoch, and try three learning rates.",
      "Train the same model with a library (e.g. scikit-learn in Python, or a JS ML library) and compare weights and metrics.",
      "Report accuracy, precision, recall and a confusion matrix on the TEST set only.",
    ],
    acceptanceCriteria: [
      "A unit test checks the from-scratch gradient against a numerical (finite-difference) estimate.",
      "The loss plot shows convergence for a good learning rate and divergence for a too-large one.",
      "Test metrics of the from-scratch and library models are within a few percentage points of each other.",
      "The README explains one way the model could be unfair or misleading on this dataset.",
    ],
    technologies: ["JavaScript or Python", "a plotting library", "scikit-learn (optional)", "Jupyter or a web page"],
    milestones: [
      { title: "Data", done_when: "Dataset loaded, documented, split and standardised." },
      { title: "From scratch", done_when: "Gradient descent trains and the gradient check passes." },
      { title: "Library comparison", done_when: "Library model trained and compared." },
      { title: "Evaluation", done_when: "Test-set metrics and limitations written up." },
    ],
    testIdeas: ["Sigmoid of 0 is 0.5", "Loss of a perfect prediction is near 0", "Gradient check", "No test rows in training data"],
    stretchGoals: ["Add L2 regularisation and show how it changes the weights on separable data."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "ml-classification-gradient-descent-a1", prompt: "Which pair is (feature, label) for 'detect spam from the number of links'?", choices: ["(spam or not, number of links)", "(number of links, spam or not)", "(model, data)", "(weights, bias)"], answerIndex: 1, explanation: "The feature is the input (links); the label is the answer to predict (spam).", objective: 0 },
      { id: "ml-classification-gradient-descent-a2", prompt: "What does the loss function produce?", choices: ["The prediction", "A single number measuring how wrong the predictions are", "The learning rate", "New training data"], answerIndex: 1, explanation: "Training aims to make this number smaller.", objective: 1 },
      { id: "ml-classification-gradient-descent-a3", prompt: "Loss goes 0.69, 2.1, 9.8, NaN. Most likely cause?", choices: ["Learning rate too small", "Learning rate too large", "Too much data", "Converged"], answerIndex: 1, explanation: "Overshooting steps make the loss grow and eventually overflow.", objective: 2 },
      { id: "ml-classification-gradient-descent-a4", prompt: "When has training converged?", choices: ["When the loss reaches exactly 0", "When the loss stops meaningfully improving", "After exactly 1000 epochs", "When accuracy is 100%"], answerIndex: 1, explanation: "Noisy data rarely allows zero loss; convergence means further steps no longer help.", objective: 2 },
      { id: "ml-classification-gradient-descent-a5", prompt: "1% of transactions are fraud. A model always predicts 'not fraud'. Its accuracy is…", choices: ["1%", "50%", "99%, while catching no fraud at all", "0%"], answerIndex: 2, explanation: "Accuracy hides failure on the rare class; use precision and recall.", objective: 3 },
      { id: "ml-classification-gradient-descent-a6", prompt: "For logistic regression with one feature, the decision boundary at threshold 0.5 is where…", choices: ["w × x + b = 0", "w = b", "x = 0", "loss = 0.5"], answerIndex: 0, explanation: "sigmoid(z) = 0.5 exactly when z = 0, i.e. x = −b / w.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "ml-classification-gradient-descent-q01", tags: ["ml", "fundamentals"], difficulty: "foundation", kind: "concept", prompt: "Explain to a product manager how a classifier 'learns'.", expectedElements: ["examples with known answers", "model with adjustable numbers", "measure error (loss)", "adjust to reduce error", "repeat", "evaluate on unseen data"], modelAnswer: "We show the model many past examples where we already know the answer. It makes a guess for each, we score how wrong the guesses were with one number, and we nudge the model's internal numbers in the direction that would have made it less wrong. Repeating that thousands of times gives a model that captures the pattern, and we then check it on examples it never saw to make sure it generalises.", explanation: "Plain language with the evaluation step included.", commonWrongAnswers: ["It reads the data and understands it."] },
    { id: "ml-classification-gradient-descent-q02", tags: ["ml", "optimisation"], difficulty: "core", kind: "concept", prompt: "What is gradient descent and what role does the learning rate play?", expectedElements: ["iterative optimisation", "gradient = direction of steepest increase", "step opposite", "learning rate = step size", "too large diverges, too small slow"], modelAnswer: "Gradient descent minimises a loss by repeatedly computing the gradient, the direction in which the loss increases fastest with respect to each parameter, and stepping the parameters in the opposite direction. The learning rate is the step size: too large and it overshoots or diverges, too small and it converges very slowly. Variants like stochastic or mini-batch gradient descent use subsets of the data per step.", explanation: "Mention mini-batch for bonus.", commonWrongAnswers: ["It searches every possible parameter value."] },
    { id: "ml-classification-gradient-descent-q03", tags: ["ml", "evaluation"], difficulty: "foundation", kind: "concept", prompt: "Why do we split data into training and test sets?", expectedElements: ["estimate performance on unseen data", "detect overfitting", "test set untouched until the end", "validation set for tuning"], modelAnswer: "To estimate how the model will perform on new data. A model can memorise its training examples, so scoring it on them overstates quality. The test set is held back and used once at the end; tuning decisions use a separate validation set or cross-validation, so the test score stays an honest estimate.", explanation: "Validation vs test distinction is a strong signal.", commonWrongAnswers: ["To make training faster."] },
    { id: "ml-classification-gradient-descent-q04", tags: ["ml", "metrics"], difficulty: "core", kind: "scenario", prompt: "Your fraud model has 99.5% accuracy. Should you ship it?", expectedElements: ["check class balance", "precision/recall/confusion matrix", "baseline of always-negative", "business cost of errors", "threshold choice"], modelAnswer: "Not on that number alone. If fraud is around 0.5% of transactions, always predicting 'not fraud' also scores 99.5%. I would look at the confusion matrix and at precision and recall for the fraud class, compare against that trivial baseline, and pick a threshold based on the business cost of missed fraud versus false alarms.", explanation: "Classic accuracy-paradox question.", commonWrongAnswers: ["Yes, 99.5% is excellent."] },
    { id: "ml-classification-gradient-descent-q05", tags: ["ml", "debugging"], difficulty: "core", kind: "debugging", prompt: "Training loss decreases nicely but test performance is poor. What is happening and what do you try?", expectedElements: ["overfitting", "more data", "regularisation", "simpler model", "feature review", "check leakage/distribution shift"], modelAnswer: "Most likely overfitting: the model fits noise in the training data. I would try regularisation, a simpler model or fewer features, more training data, and early stopping. I would also check that the train and test sets come from the same distribution and that there is no leakage or bug in how the test set is processed, such as scaling with different statistics.", explanation: "Include data checks, not just model tweaks.", commonWrongAnswers: ["Train for more epochs."] },
    { id: "ml-classification-gradient-descent-q06", tags: ["ml", "loss"], difficulty: "advanced", kind: "concept", prompt: "Why use log loss (cross-entropy) for classification instead of squared error?", expectedElements: ["probabilistic interpretation / maximum likelihood", "punishes confident wrong predictions", "convex for logistic regression", "better gradients"], modelAnswer: "Log loss is the negative log-likelihood of the labels under the model's predicted probabilities, so minimising it is maximum-likelihood estimation. It heavily penalises confident wrong predictions, and for logistic regression it gives a convex loss surface with well-behaved gradients. Squared error with a sigmoid output produces a non-convex surface and weak gradients when predictions are very wrong.", explanation: "Advanced; convexity point is key.", commonWrongAnswers: ["Squared error only works for regression by definition."] },
    { id: "ml-classification-gradient-descent-q07", tags: ["ml", "features"], difficulty: "core", kind: "concept", prompt: "Why standardise features before gradient descent?", expectedElements: ["different scales make loss surface elongated", "slow/unstable convergence", "use train statistics only to avoid leakage"], modelAnswer: "When features have very different scales, the loss surface becomes stretched, so one learning rate is too large for some directions and too small for others. That makes convergence slow or unstable. Standardising, subtracting the mean and dividing by the standard deviation, puts features on comparable scales. The mean and standard deviation must come from the training set only, to avoid leaking test information.", explanation: "Leakage caveat matters.", commonWrongAnswers: ["It makes the model more accurate on all datasets."] },
    { id: "ml-classification-gradient-descent-q08", tags: ["ml", "judgement"], difficulty: "core", kind: "design", prompt: "When would you choose a simple logistic regression over a deep neural network?", expectedElements: ["small/tabular data", "interpretability", "speed/cost", "baseline", "regulatory needs"], modelAnswer: "With small or tabular datasets, when interpretability matters (for example, regulated decisions where you must explain the factors), when training and inference must be cheap and fast, and always as a baseline. If a neural network cannot clearly beat a well-tuned logistic regression on held-out data, its extra cost and opacity are not justified.", explanation: "Shows engineering judgement.", commonWrongAnswers: ["Neural networks are always better."] },
  ],
  references: [
    { title: "Google Machine Learning Crash Course: Logistic regression", url: "https://developers.google.com/machine-learning/crash-course/logistic-regression", kind: "course" },
    { title: "Google Machine Learning Crash Course: Linear regression: Gradient descent", url: "https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent", kind: "course" },
    { title: "scikit-learn User Guide: Logistic regression", url: "https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Loss minimisation, gradients, learning rates, held-out evaluation and the accuracy paradox."],
  versionSpecific: ["Library APIs (e.g. scikit-learn parameter names and defaults) change between versions."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
