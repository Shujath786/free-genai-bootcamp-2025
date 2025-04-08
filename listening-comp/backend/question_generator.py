import boto3
import json
from typing import Dict, List, Optional
from backend.vector_store import QuestionVectorStore

class QuestionGenerator:
    def __init__(self):
        """Initialize Bedrock client and vector store"""
        self.bedrock_client = boto3.client('bedrock-runtime', region_name="us-east-1")
        self.vector_store = QuestionVectorStore()
        self.model_id = "amazon.nova-lite-v1:0"

    def _invoke_bedrock(self, prompt: str) -> Optional[str]:
        """Invoke Bedrock with the given prompt"""
        try:
            messages = [{
                "role": "user",
                "content": [{
                    "text": prompt
                }]
            }]
            
            response = self.bedrock_client.converse(
                modelId=self.model_id,
                messages=messages,
                inferenceConfig={"temperature": 0.7}
            )
            
            return response['output']['message']['content'][0]['text']
        except Exception as e:
            print(f"Error invoking Bedrock: {str(e)}")
            return None

    def generate_similar_question(self, topic: str, level: str = "beginner") -> Dict:
        """Generate a new question similar to existing ones on a given topic
        
        Args:
            topic: str - The topic to generate a question about (e.g., "greetings", "family", "food")
            level: str - Difficulty level ("beginner", "intermediate", "advanced")
        """
        # Get similar questions for context
        similar_questions = self.vector_store.search_similar_questions(topic=topic, n_results=3)
        
        if not similar_questions:
            return None
        
        # Create context from similar questions
        context = "Here are some example Arabic listening comprehension questions:\n\n"
        for idx, q in enumerate(similar_questions, 1):
            context += f"Example {idx}:\n"
            context += f"Situation: {q.get('situation', '')}\n"
            context += f"Question: {q.get('question', '')}\n"
            if 'options' in q:
                context += "Options:\n"
                for i, opt in enumerate(q['options'], 1):
                    context += f"{i}. {opt}\n"
            context += "\n"

        # Create prompt for generating new question
        prompt = f"""Based on the following example Arabic listening comprehension questions, create a new {level} level question about {topic}.
        The question should follow the same format but be different from the examples.
        Make sure the question tests listening comprehension and has a clear correct answer.
        
        {context}
        
        Generate a new question in Arabic (using English transliteration when needed) following the exact same format as above. 
        Include all components (Situation, Question, and Options). Make sure the question is appropriate for {level} level learners,
        challenging but fair, and the options are plausible but with only one clearly correct answer.
        Return ONLY the question without any additional text.
        
        New Question:
        """

        # Generate new question
        response = self._invoke_bedrock(prompt)
        if not response:
            return None

        # Parse the generated question
        try:
            lines = response.strip().split('\n')
            question = {}
            current_key = None
            current_value = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                if line.startswith("Situation:"):
                    if current_key:
                        question[current_key] = ' '.join(current_value)
                    current_key = 'situation'
                    current_value = [line.replace("Situation:", "").strip()]
                elif line.startswith("Question:"):
                    if current_key:
                        question[current_key] = ' '.join(current_value)
                    current_key = 'question'
                    current_value = [line.replace("Question:", "").strip()]
                elif line.startswith("Options:"):
                    if current_key:
                        question[current_key] = ' '.join(current_value)
                    current_key = 'options'
                    current_value = []
                elif line[0].isdigit() and line[1] == "." and current_key == 'options':
                    current_value.append(line[2:].strip())
                elif current_key:
                    current_value.append(line)
            
            if current_key:
                if current_key == 'options':
                    question[current_key] = current_value
                else:
                    question[current_key] = ' '.join(current_value)
            
            # Ensure we have exactly 4 options
            if 'options' not in question or len(question.get('options', [])) != 4:
                # Use default Arabic options if we don't have exactly 4
                question['options'] = [
                    "نعم",
                    "لا",
                    "ربما",
                    "لا أعرف"
                ]
            
            return question
        except Exception as e:
            print(f"Error parsing generated question: {str(e)}")
            return None

    def get_feedback(self, question: Dict, selected_answer: int) -> Dict:
        """Generate feedback for the selected answer"""
        if not question or 'options' not in question:
            return None

        # Create prompt for generating feedback
        prompt = f"""Given this Arabic listening comprehension question and the selected answer, provide feedback explaining if it's correct 
        and why. Keep the explanation clear and concise, using both Arabic and English.
        
        Situation: {question['situation']}\n
        Question: {question['question']}\n
        Options:\n"""
        
        for i, opt in enumerate(question['options'], 1):
            prompt += f"{i}. {opt}\n"
        
        prompt += f"\nSelected Answer: {selected_answer}\n"
        prompt += "\nProvide feedback in JSON format with these fields:\n"
        prompt += "- correct: true/false\n"
        prompt += "- explanation: brief explanation in both Arabic and English\n"
        prompt += "- correct_answer: the number of the correct option (1-4)\n"

        # Get feedback
        response = self._invoke_bedrock(prompt)
        if not response:
            return None

        try:
            # Parse the JSON response
            feedback = json.loads(response.strip())
            return feedback
        except:
            # If JSON parsing fails, return a basic response
            return {
                "correct": False,
                "explanation": "عذراً، لا يمكن توليد تعليق مفصل. يرجى المحاولة مرة أخرى. / Sorry, unable to generate detailed feedback. Please try again.",
                "correct_answer": 1  # Default to first option
            }

if __name__ == "__main__":
    # Example usage
    generator = QuestionGenerator()
    question = generator.generate_similar_question("greetings", "beginner")
    if question:
        print("Generated Question:", json.dumps(question, ensure_ascii=False, indent=2))
        feedback = generator.get_feedback(question, 1)
        print("\nFeedback:", json.dumps(feedback, ensure_ascii=False, indent=2))
