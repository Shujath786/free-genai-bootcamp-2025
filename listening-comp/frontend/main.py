import streamlit as st
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from backend.chat import BedrockChat
from backend.vector_store import QuestionVectorStore
from backend.audio_generator import AudioGenerator

# Page configuration
st.set_page_config(
    page_title="Arabic Learning Assistant",
    page_icon="☪️",
    layout="wide"
)

def load_stored_questions():
    """Load previously stored questions from JSON file"""
    questions_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "backend/data/stored_questions.json"
    )
    if os.path.exists(questions_file):
        with open(questions_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_question(question_data, practice_type, topic, audio_file=None):
    """Save a generated question to JSON file"""
    questions_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "backend/data/stored_questions.json"
    )
    
    # Load existing questions
    stored_questions = load_stored_questions()
    
    # Create a unique ID for the question using timestamp
    question_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Add metadata
    stored_data = {
        "question": question_data,
        "practice_type": practice_type,
        "topic": topic,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "audio_file": audio_file
    }
    
    # Add to stored questions
    stored_questions[question_id] = stored_data
    
    # Save back to file
    os.makedirs(os.path.dirname(questions_file), exist_ok=True)
    with open(questions_file, 'w', encoding='utf-8') as f:
        json.dump(stored_questions, f, ensure_ascii=False, indent=2)
    
    return question_id

def render_interactive_stage(vector_store=None, bedrock_chat=None, audio_gen=None):
    # Initialize vector_store and bedrock_chat if not provided
    if vector_store is None:
        from backend.vector_store import QuestionVectorStore
        vector_store = QuestionVectorStore()
    
    if bedrock_chat is None:
        from backend.chat import BedrockChat
        bedrock_chat = BedrockChat()
        
    if audio_gen is None:
        from backend.audio_generator import AudioGenerator
        audio_gen = AudioGenerator()
    
    # Ensure session state is initialized
    if 'current_question' not in st.session_state:
        st.session_state.current_question = None
    if 'feedback' not in st.session_state:
        st.session_state.feedback = None
    if 'audio_files' not in st.session_state:
        st.session_state.audio_files = None
    if 'voice_gender' not in st.session_state:
        st.session_state.voice_gender = 'Female'  # Default to female voice
    
    # Initialize stored questions in session state if not present
    if 'stored_questions' not in st.session_state:
        st.session_state.stored_questions = load_stored_questions()
    
    # Create sidebar
    with st.sidebar:
        st.header("Saved Questions")
        if st.session_state.stored_questions:
            # Add refresh button
            if st.button("🔄 Refresh Questions"):
                st.session_state.stored_questions = load_stored_questions()
                st.rerun()
                
            # Show saved questions
            for qid, qdata in st.session_state.stored_questions.items():
                # Create a button for each question
                button_label = f"{qdata['practice_type']} - {qdata['topic']}\n{qdata['created_at']}"
                if st.button(button_label, key=qid):
                    # Create a full question object from stored data
                    # Create question object from stored data
                    st.session_state.current_question = qdata['question']
                    st.session_state.current_practice_type = qdata['practice_type']
                    st.session_state.current_topic = qdata['topic']
                    st.session_state.feedback = None
                    # Handle audio files
                    audio_files = qdata.get('audio_files')
                    if audio_files and isinstance(audio_files, dict):
                        question_audio = audio_files.get('question')
                        option_audios = audio_files.get('options', [])
                        if question_audio and os.path.exists(question_audio) and all(os.path.exists(oa) for oa in option_audios):
                            st.session_state.audio_files = audio_files
                        else:
                            st.session_state.audio_files = None
                    else:
                        st.session_state.audio_files = None
                    st.rerun()
        else:
            st.info("No saved questions yet. Generate some questions to see them here!")
    
    # Practice type selection
    practice_types = ["Dialogue Practice", "Vocabulary Quiz", "Listening Exercise"]
    practice_type = st.selectbox("Select Practice Type", practice_types)
    
    # Audio section
    if st.session_state.current_question:
        st.subheader('Audio')
        col1, col2 = st.columns(2)
        
        with col1:
            # Voice selection
            voice_gender = st.radio(
                "Select Voice",
                ["Female", "Male"],
                horizontal=True,
                key="voice_gender"
            )
            
            if st.button('Generate Audio'):
                with st.spinner('Generating audio for question and answers...'):
                    try:
                        # Generate audio for question
                        question_audio = audio_gen.generate_audio(
                            st.session_state.current_question['question'],
                            gender=voice_gender.lower()
                        )
                        
                        # Generate audio for options with a small delay to ensure unique filenames
                        option_audios = []
                        for option in st.session_state.current_question['options']:
                            # Add a small delay to ensure unique timestamps
                            import time
                            time.sleep(0.1)  # 100ms delay
                            option_audio = audio_gen.generate_audio(option, gender=voice_gender.lower())
                            option_audios.append(option_audio)
                        
                        # Store all audio files in session state
                        st.session_state.audio_files = {
                            'question': question_audio,
                            'options': option_audios
                        }
                        
                        # Update stored question with audio files
                        stored_questions = load_stored_questions()
                        for qid, qdata in stored_questions.items():
                            if qdata['question'] == st.session_state.current_question['question']:
                                qdata['audio_files'] = st.session_state.audio_files
                                save_question(qdata['question'], qdata['practice_type'], qdata['topic'], st.session_state.audio_files)
                                st.session_state.stored_questions = load_stored_questions()  # Refresh stored questions
                                break
                    except Exception as e:
                        st.error(f"Error generating audio: {str(e)}")
        
        with col2:
            if st.session_state.audio_files is not None:
                st.subheader('Question Audio')
                question_audio = st.session_state.audio_files.get('question')
                if question_audio and os.path.exists(question_audio):
                    st.audio(question_audio)
                
                st.subheader('Answer Options')
                for i, option_audio in enumerate(st.session_state.audio_files.get('options', [])):
                    if os.path.exists(option_audio):
                        st.write(f"Option {i+1}:")
                        st.audio(option_audio)
            else:
                st.info('Click "Generate Audio" to create audio for question and answers.')
    
    # Topic selection based on practice type
    topics = {
        "Dialogue Practice": ["Daily Conversation", "Shopping", "Restaurant", "Travel", "School/Work"],
        "Vocabulary Quiz": ["Family", "Colors", "Numbers"],
        "Listening Exercise": ["Weather", "Travel", "Hobbies"]
    }
    topic = st.selectbox("Select Topic", topics[practice_type])
    
    # Generate or retrieve question
    if st.button("Generate Question"):
        # Find similar questions in the vector store
        similar_qs = vector_store.find_similar_questions(
            f"{practice_type.lower()} about {topic.lower()}",
            k=3
        )
        
        # Prompt for question generation
        prompt = f"""Based on these similar questions: {json.dumps(similar_qs)}
        Generate a new {practice_type.lower()} question about {topic.lower()}.
        Return only valid JSON with this structure:
        {{
            "question": "the question text in Arabic and English",
            "options": ["option1", "option2", "option3", "option4"],
            "correct_answer": 0,  # index of correct option
            "explanation": "explanation in English with Arabic vocabulary notes"
        }}"""
        
        response_text = bedrock_chat.generate_response(prompt)
        if response_text is None:
            st.error("Failed to get response from model")
            st.session_state.current_question = {
                "question": "Error: Could not generate a question",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correct_answer": 0,
                "explanation": "Please try again with a different topic or practice type."
            }
        else:
            try:
                question_data = json.loads(response_text)
                st.session_state.current_question = question_data
                # Save the generated question and force sidebar refresh
                save_question(question_data, practice_type, topic)
                st.session_state.stored_questions = load_stored_questions()  # Refresh stored questions
                st.rerun()  # Force a rerun to update the sidebar
            except (json.JSONDecodeError, TypeError):
                st.error("Failed to parse model response as JSON")
                st.session_state.current_question = {
                    "question": "Error: Could not generate a valid question",
                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                    "correct_answer": 0,
                    "explanation": "Please try again with a different topic or practice type."
                }
        
        st.session_state.current_practice_type = practice_type
        st.session_state.current_topic = topic
        st.session_state.feedback = None
    
    # Display current question if exists
    if st.session_state.current_question:
        # Use lowercase 'question' key consistently
        st.write(st.session_state.current_question['question'])
        
        # Rest of the existing question display logic...
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("Practice Scenario")
            q = st.session_state.current_question
            st.write(q['question'])
            
            # If we have feedback, show correct/incorrect answers
            if st.session_state.feedback:
                correct = st.session_state.feedback.get('correct', False)
                correct_answer = q['correct_answer']
                selected_index = st.session_state.selected_answer if hasattr(st.session_state, 'selected_answer') else -1
                
                st.write("\n**Your Answer:**")
                for i, option in enumerate(q['options']):
                    if i == correct_answer and i == selected_index:
                        st.success(f"{i+1}. {option} ✓ (Correct!)")
                    elif i == correct_answer:
                        st.success(f"{i+1}. {option} ✓ (This was the correct answer)")
                    elif i == selected_index:
                        st.error(f"{i+1}. {option} ✗ (Your answer)")
                    else:
                        st.write(f"{i+1}. {option}")
                
                # Show explanation
                st.write("\n**Explanation:**")
                                                                                                   
                if correct:
                    st.success(q['explanation'])
                else:
                    st.error(q['explanation'])
                
                # Add button to try new question
                if st.button("Try Another Question"):
                    st.session_state.feedback = None
                    st.session_state.current_question = None
                    st.rerun()
            else:
                # Display options as radio buttons when no feedback yet
                selected = st.radio(
                    "Choose your answer:",
                    q['options'],
                    index=None,
                    format_func=lambda x: f"{q['options'].index(x) + 1}. {x}"
                )
                
                # Submit answer button
                if selected and st.button("Submit Answer"):
                    selected_index = q['options'].index(selected)
                    st.session_state.selected_answer = selected_index
                                                
                                                                                                       
                    st.session_state.feedback = {
                                           
                        'correct': selected_index == q['correct_answer'],
                        'explanation': q['explanation']
                    }
                    st.rerun()
        
        with col2:
            st.subheader("Audio")
            if practice_type == "Listening Exercise":
              st.info("Audio will appear here")
        
        st.subheader("Feedback")
        # Placeholder for feedback
        st.info("Feedback will appear here")
                                                           
                            
                                                      
                                                                                                                 
                                    
                                                                             
                                                 
                                        
                                                                 
                            
                                                
                                                                                         
                                                                 
                             
                            
                                                          
                                                              
                                                                             
                                
                                                                       
                            
                                                                    
                                          
                                                                  
                                                                       
                                                               
                                          
                             
                                      
                                              
                                                                         
                                                            
                                                                 
                 
                                                               
         
                                                                     

def load_stored_questions():
    """Load previously stored questions from JSON file"""
    questions_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'backend/data',
        'stored_questions.json'
    )
    if os.path.exists(questions_file):
        with open(questions_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}



def main():
    # Initialize session state attributes if they don't exist
    if 'transcript' not in st.session_state:
        st.session_state.transcript = None
    if 'messages' not in st.session_state:
        st.session_state.messages = []
    
    # Set page title
    st.title("Arabic Learning Assistant")
    
    # Initialize components
    bedrock_chat = BedrockChat()
    vector_store = QuestionVectorStore()
    
    # Render interactive learning stage
    render_interactive_stage(vector_store, bedrock_chat)
    
    # Debug section at the bottom
    with st.expander("Debug Information"):
        st.json({
            "transcript_loaded": st.session_state.transcript is not None,
            "chat_messages": len(st.session_state.messages)
        })

if __name__ == "__main__":
    main()