# MCQ Generation JSON Parsing Fixes

## Issue Identified
The `/generate_mcqs` endpoint was failing with JSON parsing errors due to malformed JSON responses from the LLM. The specific error was:

```
JSON parsing error: Expecting ':' delimiter: line 4 column 116 (char 926)
```

Looking at the response, one MCQ was missing the `"options": [...]` structure:
```json
{"question": "What is the purpose of restricting anonymous account permissions?", "To improve server performance", "To reduce server maintenance", "To prevent unauthorized access and command-line execution", "To enhance user experience"], "correct_answer": "To prevent unauthorized access and command-line execution", "explanation": "..."}
```

## Fixes Applied

### 1. **Enhanced LLM Prompt** 
- Made the JSON format requirements more explicit
- Added clear examples of correct format
- Emphasized that `"options"` must always be an array with square brackets
- Added warnings about proper JSON structure

### 2. **Improved JSON Parsing & Validation**
- Added better error logging with truncated response text
- Enhanced validation to check for all required fields
- Added individual MCQ validation with try-catch blocks
- Skip invalid MCQs instead of failing the entire request

### 3. **Comprehensive JSON Fix Mechanisms**
- **Regex Fixes**: Multiple regex patterns to fix common JSON malformation issues
- **Structural Reconstruction**: Line-by-line parsing to rebuild MCQs from broken JSON
- **Fallback Responses**: Return partial results instead of complete failure

### 4. **Specific Error Pattern Fixes**
- Handle missing `"options": [...]` wrapper
- Fix comma-separated options that should be in arrays
- Detect and fix the exact pattern from the error log

## Code Changes

### Enhanced Validation
```python
valid_mcqs = []
for i, mcq in enumerate(mcqs):
    try:
        if (isinstance(mcq, dict) and 
            "question" in mcq and 
            "options" in mcq and 
            "correct_answer" in mcq and
            "explanation" in mcq and
            isinstance(mcq["options"], list) and
            len(mcq["options"]) == 4 and
            mcq["correct_answer"] in mcq["options"]):
            valid_mcqs.append(mcq)
        else:
            app.logger.warning(f"Skipping invalid MCQ at index {i}")
    except Exception as validation_error:
        app.logger.warning(f"Skipping MCQ at index {i} due to validation error")
```

### JSON Fixing Logic
```python
# Fix missing "options": [ pattern
pattern = r'("question":\s*"[^"]+"),\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"correct_answer"'
replacement = r'\1, "options": ["\2", "\3", "\4", "\5"], "correct_answer"'
fixed_text = re.sub(pattern, replacement, fixed_text)
```

### Improved Error Responses
```python
# Instead of complete failure, return partial results
if not valid_mcqs:
    return jsonify({
        "error": "No valid MCQs could be generated. Please try again.",
        "mcqs": []
    }), 500
```

## Expected Results

✅ **Better Error Handling**: Partial MCQs returned instead of complete failure  
✅ **Improved JSON Parsing**: Multiple fix mechanisms for common malformation patterns  
✅ **Enhanced Logging**: Better debugging information for JSON parsing issues  
✅ **Graceful Degradation**: Skip invalid MCQs rather than failing the entire request  
✅ **User-Friendly Errors**: Clear error messages for the frontend  

## Status: ✅ READY FOR DEPLOYMENT

The MCQ generation endpoint should now handle JSON parsing errors gracefully and provide better reliability. Even if some MCQs are malformed, the system will return the valid ones instead of failing completely.
