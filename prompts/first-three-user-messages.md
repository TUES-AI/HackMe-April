# First Three User Messages

## Message 1

```text
Prepare for a really loong task!

I am pasting you my chat with ChatGPT where I brainstormed a bit what I want to do. For now read it, reason about it and be ready for my next prompt telling oyu what to do:

<user>
I am doing the AI+Software club in my school and need help definindg the homework for the 3 week holyday. I want to create a multi path hack me project as homework - it will be completely optional and different tracks will focus on different programming skills so students can form teams based on what they choose is interesting.

I won’t put grades but will give funny rewards to the top teams in each category.

Here is my github org for the club:
https://github.com/TUES-AI/
https://github.com/orgs/TUES-AI/repositories

Here are the 3 tracks I thought of by now, you can add more if you think of something really good or make these better:

1.Cryptography - I will get a random book chapter or poem from literature class and encrypt it in a hard way and the idea will be the students to try to decipher as sole objective. There could actually be 3 poems/chapters/strings to decipher with raising difficulty but they will have weeks so even the first should be more than just Cesar.

For the second and third or possible only third I even think about cipher that the lenghts of the strings get changed with encryption so such lenght pattern matching is not possible. 

For this I don’t know specific cipher that does this but thought it will be funny if the encryption was just to run gpt 2 tokenizer on it and give them the numbers - this will be really good bc we are AI club but what I don’t want from this is to be easy to guess by AI. If I give random numbers to chatGPT today and tell it its a cipher to decode it guesses it right away which makes the task obsolete - I will encourage my students to use AI for the research part of the problem, but AI shouldn’t 1 shot the hole thing.

Think about this one for the specific ciphers

2.Train some AI model against some problem with the tooling we created in class:
https://github.com/TUES-AI/AutoGrad

I just need to define a problem and give them to research and seacrch for dataset or I give them direct link to dataset like Kaggle style comp and tell them to just engineer the best model solution.

This could also be 3 step with getting harder and harder and need help with choosing the right datasets and problems

3.Create the best game about “learning enemy” under specific constrains like <4kb the hole game.

Find the 4kb could be any number that forces them to be creative and write in JS/C. 4kb is the largest QR code so I’ve created such games taht I can share with a QR on paper and its just in my head but the constrain could be other type not filesize, maybe lines of code (which allows for game engines and assests which would get deleted by filesize constrains). 

Again the main objective is to have somehting AI-like that learns in the game, if they want they can even put autograd and train a neural network for the oponent with RL but we havent go that in depth into that topic, which can be usefulk for them to learn on their own.



These are the things I thought of accept to have a 4th path and need a lot of help with the first 3 from you!!!


The thing will be graded for the rewards not based on who finished first or who got the highest acccuracy on the tests but who had the best research approach for the task - Everything for the project will be forced to be commited in github repo per team where I would want folders for each part/day of work where they put code, markdown files with links to sites and youtube videos they watch, markdown with problems they faced and how they solved them and so on. I will grade on that, don’t care if final result runs cuz ai coding agent can do that, I wnat to train research and problem solving skills. 



Go onto a research and get back to me with the full plan with the specific recommendations and fallbacks for the subtopic things I need help deciding!

Also tell me how you think how good my proposed orchestration is and suggest improvements there if you can think of!
</user>

<chatgpt>
This is a **very good orchestration idea**. The strongest part is that you are optimizing for **research trail, debugging, and decision-making**, not just final output. That is exactly the right way to make an “AI-era homework hackathon,” because finished code is now cheap, but good hypotheses, experiments, and pivots are still real skill. Also, your org already has a clean place to host this: the TUES-AI org includes `AutoGrad`, `TuesCode`, and an almost-empty `HackMe-April` repo that can become the main hub. ([GitHub][1])

My main change would be this: **do not force “folder per day.”** Force **folder per research session / milestone** instead. Students do not work evenly every day, and fake day folders create low-value spam. You want evidence of thinking, not calendar theater.

## What I would change in your orchestration

1. **One hub repo, many team repos**
   Use `TUES-AI/HackMe-April` as the central brief/rules/rubric repo, and let each team make its own repo from a template.

2. **Grade the process with a fixed rubric**
   I would make the score mostly:

   * 40% research trail
   * 20% experiment quality
   * 15% dead ends + debugging
   * 15% technical depth
   * 10% final demo/result

   Functioning final code should matter, but only a little.

3. **Require an “AI usage disclosure”**
   Add one file: `AI_USAGE.md`
   Students must note:

   * which AI tools they used
   * for what
   * what they accepted/rejected
   * where AI was wrong

   That turns AI from cheating into analyzable methodology.

4. **Require a tiny final defense**
   Even 4–5 minutes per team is enough.
   Ask:

   * what was your first wrong hypothesis?
   * what changed your approach?
   * what would you try next with 2 more days?

   That instantly reveals who actually did research.

5. **Normalize difficulty across tracks**
   Track winners should not be “the hardest track wins.”
   Judge each track separately, then maybe give one overall “Best Research Team.”

## Best overall structure

I would keep **4 tracks max**:

1. **Cipher Hunters** — cryptanalysis / reverse engineering
2. **AutoGrad Scientist** — model training / experimentation
3. **Learning Enemy** — adaptive game AI under constraints
4. **AI Toolsmith** — tools, benchmark harnesses, visualizers, dataset utilities

That fourth one is worth adding because it captures students who are strong in software engineering but not excited by pure crypto or game dev.

---

# 1) Cryptography track

## My recommendation

Do **not** make three completely unrelated ciphers.

That sounds varied, but it actually teaches less. Students will spend their time re-orienting instead of building techniques. Better is:

* Level 1: classical pattern attack
* Level 2: classical + one twist
* Level 3: modern/AI-flavored layered cipher

Also: **do not use raw GPT-2 token IDs alone**. GPT-2 tokenization is publicly documented as byte-level BPE, and even spacing changes tokenization, so “here are weird integers” is guessable if someone notices the vocabulary pattern. ([Hugging Face][2])

## Best version of this track

### Level 1 — classical but not trivial

Use **Vigenère** or **Affine + transposition** on a Bulgarian or English literature excerpt.

Give them:

* the ciphertext
* the language
* punctuation preserved
* approximate plaintext length
* maybe one tiny hint like “not monoalphabetic”

Why this works:

* teaches frequency analysis, repeated-pattern thinking, Kasiski-style reasoning
* still solvable by code, not just hand work
* AI helps with research, but does not instantly finish it

### Level 2 — same family, more annoying

Use **homophonic substitution + columnar transposition**.

Why:

* frequency attacks become less obvious
* students need to write tooling, not only stare at text
* still “classic crypto,” so it feels fair

Good clue policy:

* tell them it is still fundamentally character-level
* tell them the source text is natural language
* maybe tell them word boundaries are not preserved

### Level 3 — AI-club flavored, actually good

This is where your tokenizer idea becomes useful, but only as **one layer**, not the whole cipher.

I would do:

1. plaintext
2. GPT-2 tokenization
3. token IDs transformed with a simple keyed rule

   * either affine mod vocabulary size
   * or XOR/addition with a small PRNG stream
4. pack IDs into **variable-length encoding**
5. output with a custom alphabet

That does two good things:

* it breaks naive length-pattern matching
* it stops one-shot “this looks like GPT-2 IDs” solving

Your hints can release over time:

* Hint 1: “This is not character-level.”
* Hint 2: “Whitespace matters.”
* Hint 3: “The base symbol vocabulary is public.”

That is enough to make it researchable without making it instantly dead.

## Why your GPT-2 idea is good but incomplete

The GPT-2 tokenizer is indeed a neat AI-themed ingredient, but by itself it is too reversible because the tokenizer behavior is public and easy to test. Hugging Face documents GPT-2’s tokenizer as byte-level BPE and explicitly shows that `"Hello world"` and `" Hello world"` produce different IDs because leading spaces matter. ([Hugging Face][2])

## Fallback if level 3 becomes too hard

Replace level 3 with:

* **tokenizer IDs + repeating-key XOR + visible separators**, or
* **book cipher + columnar transposition**

That keeps the “research + scripting” feel while staying solvable.

## Nice extra rule

Require every crypto team to submit:

* `solver/`
* `hypotheses.md`
* `why-we-rejected-these-ideas.md`
* `final-writeup.md`

## Resource seed

If you want to point them somewhere without spoon-feeding, picoCTF’s official learning resources explicitly expose beginners to cryptography challenges ranging from Caesar to RSA and more advanced material. ([picoctf.org][3])

---

# 2) AutoGrad model-training track

This track should be built around what your current `AutoGrad` repo **actually is**, not what a full ML framework is.

Right now `AutoGrad` is a tiny pure-Python autograd/neural-net playground with:

* scalar `Value` objects
* ReLU
* softmax
* cross-entropy over integer labels
* a small training demo
* files like `AutoGrad.py`, `NeuralNetwork.py`, and `optimizer.py` rather than a high-performance tensor backend. ([GitHub][4])

So I would **not** make the default task something CNN-heavy or huge-image-heavy.

## Best progression

### Level 1 — Banknote Authentication

This is a great starter dataset:

* 1,372 instances
* 4 real-valued features
* no missing values
* binary classification ([archive.ics.uci.edu][5])

Why it fits:

* tiny input dimension
* easy to normalize
* enough data to make train/validation/test behavior meaningful
* perfect for learning baselines, overfitting, learning-rate issues

### Level 2 — Seeds

This is a very nice middle step:

* 3 wheat varieties
* 70 samples each
* 7 real-valued attributes
* multiclass classification ([archive.ics.uci.edu][6])

Why it fits:

* still small
* multiclass, which is good for your current softmax setup
* harder than banknotes without becoming infrastructure work

### Level 3 — Digits

This is the best hard mode for your current framework:

* 1,797 total samples
* 8×8 digit images
* flattened to 64 features
* 10 classes ([Scikit-learn][7])

Why this is the right “hard”:

* feels like image classification
* still numerically small enough to flatten into an MLP
* students can explore hidden sizes, normalization, better training loops, mini-batching, optimizer changes

## Best fallback datasets

### If you want an easier middle level

Use **Breast Cancer Wisconsin**:

* 569 samples
* 30 features
* binary classification
* officially described by scikit-learn as a classic, very easy dataset ([Scikit-learn][8])

### If you want a competition-style fallback

Use **Titanic**, but only as bonus or fallback. Kaggle positions it as a starter competition, but it adds more preprocessing and categorical handling, which means students may spend more time on data wrangling than model research. ([Kaggle][9])

### If a team rewrites/optimizes the framework heavily

Then allow **Fashion-MNIST** as a stretch goal. It has 60,000 training examples and 10,000 test examples of 28×28 grayscale images across 10 classes, which is good for benchmarking but probably too heavy for the current scalar-style setup unless they substantially improve the code. ([GitHub][10])

## What the task should reward

Do **not** make it “highest accuracy wins.”

Make it:

* best baseline
* best hypothesis design
* best ablation
* best debugging
* best explanation of why certain ideas failed

## Exact required deliverables for this track

I would require:

* one baseline model
* at least 5 logged experiments
* one ablation table
* one “surprise finding”
* one failure they understand
* one reproducibility script

Good required files:

* `dataset_notes.md`
* `baseline.md`
* `experiments/exp-001.md`
* `experiments/exp-002.md`
* `ablations.md`
* `mistakes.md`
* `reproduce.sh` or `run.py`

---

# 3) Learning-enemy game track

This is a strong idea, but the rule has to define what **learning** means.

## My biggest recommendation

Do **not** define learning as “enemy gets stronger over time.”

That is just progression.

Define it as:

> the enemy changes behavior based on the player’s observed actions during the same run or across recent rounds.

Examples that should count:

* predicting where the player dodges
* tracking preferred weapon/rhythm
* camping where the player often goes
* adapting attack timing
* learning a short n-gram of player actions
* using a heatmap / bandit / Q-table / perceptron / simple NN

Examples that should **not** count:

* enemy HP increases every minute
* fixed difficulty levels
* scripted phases only
* purely random difficulty spikes

## Constraint recommendation

I would **not** use 4KB as the main default.

A better primary constraint is:

* **13KB zipped browser game**

Why:

* it is a real, proven constraint used by js13kGames, whose official rules require the zipped archive to stay within **13,312 bytes**. ([js13kGames 2025][11])

Why not 4KB:

* it is cool, but for most students it becomes a compression/code-golf contest before it becomes a game/AI contest

Also, your QR-code intuition is slightly off: standard QR code capacity tops out at **2,953 bytes of binary data** at the largest regular version/lowest correction level, so a 4KB binary game would not fit into a single standard QR code anyway. ([qrcode.com][12])

So the cleanest options are:

### Primary

**13KB zipped browser game**

### Fallback

**≤300 lines of code, no engine**
or
**≤8KB source, no external assets**

## Best judging criteria

For this track, score:

* how clearly the enemy learns
* how well the team explains the adaptation
* how creative the mechanism is
* how constrained the implementation is
* how visible the behavior change is to the player

## Strong deliverable rule

Require a `LEARNING_TRACE.md` or tiny replay/demo that shows:

* enemy behavior at start
* what it observed
* enemy behavior later

That prevents fake “trust us, it learns” submissions.

---

# 4) Fourth track: AI Toolsmith

This is the best extra track to add.

It captures students who like:

* backend
* infra
* visualization
* debugging tools
* UX
* benchmarking
* data tooling

## What the track is

Build a tool that helps other teams do better research.

Examples:

* an experiment tracker for AutoGrad runs
* a mini benchmark harness
* confusion-matrix / metric visualizer
* dataset inspector / cleaner
* crypto solver notebook template
* result dashboard
* repo log summarizer
* CLI for reproducible experiments

## Why this track is excellent

It is the most “real AI engineering” track of the four.
A lot of actual ML work is tools, evals, and experiment infrastructure.

## Best constraint

The tool must be:

* usable by another team
* documented
* demonstrated on one real club problem

## Judging

Reward:

* usefulness
* clarity
* robustness
* docs
* reproducibility
* polish of the research workflow it enables

---

# My final recommended track set

## Keep these

* **Cipher Hunters**
* **AutoGrad Scientist**
* **Learning Enemy**
* **AI Toolsmith**

## Do not add more than 4

More than 4 fragments attention and makes judging inconsistent.

---

# Repo structure I would enforce

For each team repo:

```text
README.md
TEAM.md
AI_USAGE.md
SOURCES.md
sessions/
  session-01.md
  session-02.md
  ...
experiments/
failures/
code/
artifacts/
final/
```

And each `session-XX.md` should answer:

* what did we believe?
* what did we try?
* what failed?
* what changed our mind?
* what is next?

That is much better than “folder per day.”

---

# What to put in `HackMe-April`

Your `HackMe-April` repo is currently basically empty, so it is perfect as the event hub. ([GitHub][13])

I would put:

```text
README.md
rules.md
rubric.md
faq.md
crypto/
autograd/
game/
toolsmith/
team-template/
submission-checklist.md
```

Inside each track folder:

* brief
* constraints
* starter resources
* required deliverables
* hints policy
* what counts / what does not count

---

# My opinion on your orchestration overall

It is **genuinely strong**.
The only real danger is that it can drift into:

* AI-generated repo theater
* over-scoped impossible tasks
* inconsistent judging across tracks

Your current instinct already solves half of that because you care about:

* research logs
* failed attempts
* source links
* reasoning trail

That is exactly the right backbone.

## My top 6 improvements

1. grade sessions, not days
2. add `AI_USAGE.md`
3. add a short final defense
4. use fixed rubric across all tracks
5. make crypto hinted, not fully black-box
6. keep the AI track aligned with current `AutoGrad` scale

---

# Very short “best version” of each track

## Crypto

Three-level ladder:

* Vigenère / affine+transposition
* homophonic+transposition
* GPT-2-tokenizer-inspired layered cipher with variable-length packing

## AutoGrad

Three datasets:

* Banknote
* Seeds
* Digits
  Fallback: Breast Cancer, Titanic bonus, Fashion-MNIST only for heavily extended implementations

## Game

Adaptive enemy, not fake difficulty.
Use **13KB zipped** as main constraint, not 4KB.
Fallback: ≤300 LOC no engine.

## 4th track

Toolsmith: build tools for research, evals, and reproducibility.

---

The next useful step is turning this into a **ready-to-post `HackMe-April` README + rubric + per-track brief text**.

[1]: https://github.com/TUES-AI/ "TUES AI Club · GitHub"
[2]: https://huggingface.co/docs/transformers/en/model_doc/gpt2 "GPT-2 · Hugging Face"
[3]: https://picoctf.org/resources.html "picoCTF - Learning Resources"
[4]: https://raw.githubusercontent.com/TUES-AI/AutoGrad/main/README.md "raw.githubusercontent.com"
[5]: https://archive.ics.uci.edu/ml/datasets/banknote%2Bauthentication "UCI Machine Learning Repository"
[6]: https://archive.ics.uci.edu/ml/datasets/seeds "UCI Machine Learning Repository"
[7]: https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html "load_digits — scikit-learn 1.8.0 documentation"
[8]: https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_breast_cancer.html "load_breast_cancer — scikit-learn 1.8.0 documentation"
[9]: https://www.kaggle.com/competitions/titanic?utm_source=chatgpt.com "Titanic - Machine Learning from Disaster"
[10]: https://github.com/zalandoresearch/fashion-mnist?utm_source=chatgpt.com "zalandoresearch/fashion-mnist: A ..."
[11]: https://js13kgames.com/2024/rules?utm_source=chatgpt.com "Rules | js13kGames 2024"
[12]: https://www.qrcode.com/en/about/version.html?utm_source=chatgpt.com "Information capacity and versions of QR Code | QRcode.com"
[13]: https://github.com/TUES-AI/HackMe-April "GitHub - TUES-AI/HackMe-April · GitHub"

</chatgpt>

<user>
        Completelly amazing!!! Your feedback is spot on and I am vibing with your suggestions for the tipics and the 4th topic is great! Right now I need to setup the hole ruleset to be ready to share with my superiors and poteantially ready also for students in the site.

The repo of the org is to host a github.io pages with interactive multi-page html with the main thing overview, subpages for rules, how to work on the project (the per resaerch session commits), the rewards and grading page and a page for each of the 4 tracks + main page with really cool animations and pictograms and eveyrthing. This will be hosted on the HackMe-April repo and for each student submision I will later make template repos to fork from (dw about that)
</user>
```

## Message 2

```text
you are in the empty repo root with pages deployment turned on push to main. Prepare the hole site of the HackMe challenge.

How it will go:
- use your agents for research google wiht things oyu need
- craft the hole site - pages for everything I mentioned with good dopamine hit UI. Don't care for the frontend framework whatsoever but want the hole thing mainly in bulgarian - the rules and description should be in BG, any terminology should be in EN and its fine to fix the 2 languages in a single sentance 
- push to gh to see if dpeloyment passes
- spawn subagent with google and platywright to inspect it and tell you how it looks

If you want do it in stages or all at once, I don't care.

Good work and see you in a hour when you are ready!

Before crafting the crazy plan for the task and going full auto without my intervention for 1 hour ask my questions as your reply right now for my preferences about the task so I can answer up front and then you go really end ot end full auto
```

## Message 3

```text
Amazing authonomous work! I opened it and the info is there but I want a complete redisgn - I tought such style was appropriate but I would preffer a more simplistic pure white (or black if dark mode is toggled) style site that is more of a scroller with little interactive elements. Good site that has a page i am currently thikning of is this one - https://exa.ai/docs/reference/exa-mcp (was reading this today and its good - white, some nav on the left, some very little info on right and the main thing is a scroller at the middle).

If you want use curl directly or playwright to get its html here locally to inspect better.

Try to make something like this and also know I want mobile-first to work great also!
```
