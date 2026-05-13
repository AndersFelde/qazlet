# Qazlet

A lightweight Quizlet alternative for studying with flashcards and quizzes. No dependencies, no setup—just Python.

## Quick Start

1. Run the server:
```bash
python app.py
```

2. Open `http://localhost:5000` in your browser

3. Edit `questions.json` to add your questions

4. Refresh the browser to see your questions

## Question Format

Edit `questions.json` with this format:

```json
{
  "questions": [
    {
      "type": "flipcard",
      "question": "What is the capital of France?",
      "answer": "Paris"
    },
    {
      "type": "quiz",
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correct": 1
    }
  ]
}
```

**Flipcard:** Shows question, click to reveal answer  
**Quiz:** 4 multiple choice options, auto-validates, shows summary at end

The `correct` field is the index (0-3) of the correct option.

## Generate Questions with AI

Copy and paste this entire prompt to ChatGPT, Claude, or any AI. It will generate valid JSON you can paste directly into `questions.json`:

```
Generate study questions in JSON format. Return ONLY the JSON, nothing else.

Create a mix of flipcard and quiz questions using this exact format:

{
  "questions": [
    {
      "type": "flipcard",
      "question": "question text",
      "answer": "answer text"
    },
    {
      "type": "quiz",
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correct": 0
    }
  ]
}

The "correct" field is the index (0-3) of the correct answer.

Generate 10 questions about [YOUR TOPIC HERE]. Make them educational.
```

Replace `[YOUR TOPIC HERE]` with your subject (e.g., "World War 2", "Spanish vocabulary", "Biology photosynthesis").

Copy the JSON output directly into `questions.json` and refresh your browser.