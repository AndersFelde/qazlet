# Qazlet

A lightweight, easy-to-host Quizlet alternative built with Python. Study with flashcards or take quizzes with instant feedback.

## Features

- **No Dependencies**: Uses Python's built-in HTTP server
- **Simple Setup**: Just run `python app.py`
- **Flipcard Mode**: Click cards to reveal answers  
- **Quiz Mode**: 4-option multiple choice with instant validation  
- **Progress Bar**: Visual indicator of progress  
- **Mode Switching**: Toggle between flipcard and quiz  
- **Beautiful UI**: Gradient design with smooth animations  
- **Responsive**: Works on mobile and desktop  
- **Easy JSON Format**: Edit questions without coding

## Quick Start

**No installation needed!** Only Python 3 is required.

### 1. Run the Server

```bash
python app.py
```

That's it! Open your browser to `http://localhost:5000`

### 2. Define Your Questions

Edit `questions.json` and add your questions in the format below:

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

## Question Format

### Flipcard Questions

```json
{
  "type": "flipcard",
  "question": "Your question here",
  "answer": "Your answer here"
}
```

**Fields:**
- `type`: Must be `"flipcard"`
- `question`: The text shown on the front of the card
- `answer`: The text shown when the card is flipped

### Quiz Questions

```json
{
  "type": "quiz",
  "question": "Your question here",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "correct": 0
}
```

**Fields:**
- `type`: Must be `"quiz"`
- `question`: The question to display
- `options`: Array of exactly 4 answer options
- `correct`: Index of the correct option (0-based: 0, 1, 2, or 3)

## AI Prompt for Generating Questions

Copy and paste this prompt to ChatGPT, Claude, or any AI to generate questions in the correct format:

---

Generate study questions in JSON format for Qazlet. Return ONLY valid JSON, no other text.

Create a mix of flipcard and quiz questions. Use this exact format:

**Flipcard format:**
```json
{
  "type": "flipcard",
  "question": "question text",
  "answer": "answer text"
}
```

**Quiz format (must have exactly 4 options, one correct answer):**
```json
{
  "type": "quiz",
  "question": "question text",
  "options": ["option1", "option2", "option3", "option4"],
  "correct": 0
}
```

Wrap all questions in this structure:
```json
{
  "questions": [
    { question objects here }
  ]
}
```

Generate [NUMBER] questions about [TOPIC]. Make them educational and clear.

---

**Example usage:**
- "Generate 10 questions about World War 2"
- "Generate 5 French vocabulary questions"
- "Generate 8 biology questions about photosynthesis"

Copy the AI's JSON output directly into `questions.json`.

## How to Use

1. **Mode Selection**: Click "Flipcard" or "Quiz" at the top
2. **Flipcard Mode**:
   - Click the card to flip and reveal the answer
   - Use Previous/Next buttons to navigate
3. **Quiz Mode**:
   - Click an option to answer
   - See instant feedback (correct in green, incorrect in red)
   - Correct answer is highlighted
   - Click Next to move to the next question

## Hosting

### Local Network
```bash
python app.py
# Access from other devices: http://YOUR_IP:5000
```

### Remote Server (e.g., VPS, Cloud)
- Copy the entire folder to your server
- Run `python app.py`
- No installation needed!
- Works on any server with Python 3 installed

## Project Structure

```
qazlet/
├── app.py              # HTTP server
├── questions.json      # Question definitions (edit this!)
├── requirements.txt    # Dependencies (empty - no setup needed!)
├── templates/
│   └── index.html      # Main page
└── static/
    ├── style.css       # Styling
    └── script.js       # Frontend logic
```

## Customization

- Edit `questions.json` to add/remove questions
- Modify `static/style.css` for colors and styling
- Adjust the gradient colors in the CSS for different themes

## Tips

- Mix flipcard and quiz questions in the same `questions.json`
- The app automatically filters by mode
- Progress bar works across all questions in the file
- Responsive design works on mobile and desktop
- JSON format is easy to read and edit without programming knowledge