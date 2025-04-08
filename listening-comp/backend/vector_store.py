# backend/vector_store.py
import os
import torch
from sentence_transformers import SentenceTransformer

class QuestionVectorStore:
    def __init__(self):
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.questions = []
        self.embeddings = None
        self.index_path = "question_vectors.pt"
        
    def load_or_create_index(self):
        """Load existing index or create a new one"""
        try:
            data = torch.load(self.index_path)
            self.questions = data['questions']
            self.embeddings = data['embeddings']
            print("Loaded existing index")
        except (FileNotFoundError, RuntimeError):
            # Initialize with default questions
            self.questions = []
            self.embeddings = None
            self._add_default_questions()
            print("Created new index with default questions")

    def add_question(self, question: str):
        self.questions.append(question)
        with torch.no_grad():
            embedding = self.encoder.encode([question], convert_to_tensor=True)
            if self.embeddings is None:
                self.embeddings = embedding
            else:
                self.embeddings = torch.cat((self.embeddings, embedding))

    def find_similar_questions(self, query: str, k=5):
        # Initialize with default questions if no embeddings exist
        if self.embeddings is None or len(self.questions) == 0:
            self._add_default_questions()
            
        with torch.no_grad():
            query_embed = self.encoder.encode([query], convert_to_tensor=True)
            # Ensure dimensions match for cosine similarity
            similarities = torch.nn.functional.cosine_similarity(
                self.embeddings, query_embed.repeat(len(self.questions), 1)
            )
            # Get top k similar questions
            if len(similarities) < k:
                k = len(similarities)
            _, indices = torch.topk(similarities, k)
            return [self.questions[i] for i in indices]
            
    def _add_default_questions(self):
        """Add default questions to initialize the vector store"""
        # Dialogue Practice questions
        dialogue_questions = [
            {
                "Introduction": "You are meeting someone for the first time.",
                "Conversation": "A: Marhaba! (Hello!)\nB: Marhaba! Kayfa haluk? (Hello! How are you?)\nA: Ana bekhair, shukran. Wa anta? (I'm fine, thank you. And you?)\nB: Ana bekhair aydan. (I'm fine too.)",
                "Question": "What is the appropriate response to 'Kayfa haluk?'",
                "Options": ["Ma'a salama", "Ana bekhair, shukran", "Marhaba", "Afwan"],
                "correct_answer": 1,
                "explanation": "'Ana bekhair, shukran' means 'I'm fine, thank you' which is the appropriate response to 'How are you?' (Kayfa haluk)."
            },
            {
                "Introduction": "You are saying goodbye after meeting a friend.",
                "Conversation": "A: Sayakun 'alay aldhahab alan. (I have to go now.)\nB: Hasanan. Ma'a salama! (Okay. Goodbye!)\nA: Ma'a salama! Ila al-liqa'. (Goodbye! See you later.)",
                "Question": "What does 'Ma'a salama' mean?",
                "Options": ["Thank you", "Hello", "Goodbye", "Excuse me"],
                "correct_answer": 2,
                "explanation": "'Ma'a salama' means 'Goodbye' in Arabic and is used when parting ways."
            }
        ]
        
        # Phrase Matching questions
        phrase_questions = [
            {
                "Situation": "You are listening to a weather report in Arabic.",
                "Question": "What is the Arabic word for 'rain'?",
                "Options": ["Shams", "Matar", "Thaljun", "Gha'im"],
                "correct_answer": 1,
                "explanation": "'Matar' means 'rain' in Arabic. 'Shams' means 'sun', 'Thaljun' means 'snow', and 'Gha'im' means 'cloudy'."
            },
            {
                "Situation": "You hear an announcement at the airport in Arabic.",
                "Question": "What is the Arabic phrase for 'boarding pass'?",
                "Options": ["Jawaz safar", "Bitaqat sueud al-ta'irah", "Haqibat al-safar", "Matar"],
                "correct_answer": 1,
                "explanation": "'Bitaqat sueud al-ta'irah' means 'boarding pass' in Arabic. 'Jawaz safar' means 'passport', 'Haqibat al-safar' means 'luggage'."
            },
            {
                "Situation": "You are listening to news about current events.",
                "Question": "What is the Arabic word for 'news'?",
                "Options": ["Kitab", "Akhbar", "Jaridat", "Tilifizyon"],
                "correct_answer": 1,
                "explanation": "'Akhbar' means 'news' in Arabic. 'Kitab' means 'book', 'Jaridat' means 'newspaper', and 'Tilifizyon' means 'television'."
            }
        ]
        
        # Combine all questions
        all_questions = dialogue_questions + phrase_questions
        
        # Add each question and create embeddings
        self.questions = []
        embeddings_list = []
        
        for q in all_questions:
            self.questions.append(q)
            # Extract the question text based on format
            if "Question" in q:
                question_text = q["Question"]
            else:
                question_text = q.get("question", "")
                
            with torch.no_grad():
                embed = self.encoder.encode([question_text], convert_to_tensor=True)
                embeddings_list.append(embed)
        
        # Stack embeddings
        self.embeddings = torch.cat(embeddings_list, dim=0)
        
        # Save the default questions
        self.save()

    def save(self):
        """Save the current index"""
        torch.save({
            'questions': self.questions,
            'embeddings': self.embeddings
        }, self.index_path)

    def load(self):
        """Load the index"""
        data = torch.load(self.index_path)
        self.questions = data['questions']
        self.embeddings = data['embeddings']