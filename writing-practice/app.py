import streamlit as st

import yaml
import pathlib
import pytesseract
from PIL import Image, ImageEnhance
import numpy as np
import cv2
import io
import json
import random
from src.backend.data.writing_manager import (
    get_db_connection,
    save_writing,
    update_feedback,
    get_recent_writings,
    get_writing_stats
)
from src.backend.data.word_manager import init_words_table, get_random_word
from src.backend.grading.evaluator import generate_feedback
from src.utils.helpers import load_config, load_writing_tips, initialize_session_state


# Function to check if user input matches target word
def check_word_match(user_text, target_word_english, target_word_arabic):
    """Check if the user's input matches either the English or Arabic target word"""
    user_text = user_text.strip().lower()
    target_word_english = target_word_english.strip().lower()
    target_word_arabic = target_word_arabic.strip().lower()
    
    if user_text == target_word_english or user_text == target_word_arabic:
        return True, "✅ CORRECT - Your answer matches the target word!"
    else:
        return False, "❌ INCORRECT - Your answer doesn't match the target word."

# Initialize database
def init_db():
    # Create db directory if it doesn't exist
    db_dir = pathlib.Path("db")
    db_dir.mkdir(exist_ok=True)
    
    # Initialize writings table
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS writings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            content TEXT NOT NULL,
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    
    # Initialize words table
    init_words_table()

# Load custom CSS
def load_css():
    """Load custom CSS and JavaScript"""
    # Load CSS
    css_file = pathlib.Path("static/css/style.css")
    if css_file.exists():
        with open(css_file) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    
    # Add JavaScript for canvas-to-form submission
    st.markdown("""
    <script>
    function submitCanvas() {
        const imageData = getCanvasImage();
        const url = new URL(window.location.href);
        url.searchParams.set('canvas_data', imageData);
        window.location.href = url.toString();
    }
    </script>
    """, unsafe_allow_html=True)

def practice_page():
    # Main content area
    st.title("Word Practice")
    
    # Create two columns
    left_col, right_col = st.columns([1, 1])
    
    with left_col:
        # Initialize session state for current word if not exists
        if 'current_word' not in st.session_state:
            st.session_state.current_word = get_random_word()
        
        # Get New Word button
        if st.button("Get New Word", type="primary", use_container_width=True):
            st.session_state.current_word = get_random_word()
            # Clear previous results
            if 'ocr_result' in st.session_state:
                del st.session_state.ocr_result
            if 'feedback' in st.session_state:
                del st.session_state.feedback
        
        # Display current word
        st.markdown("<div class='word-display'>", unsafe_allow_html=True)
        st.markdown(f"<div style='font-size: 48px; direction: rtl;'>{st.session_state.current_word['arabic']}</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='translation-display'>{st.session_state.current_word['english']}</div>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
        
        # Instructions
        st.subheader("Instructions")
        st.markdown("Practice writing this word in Arabic. Upload your handwritten attempt.")
        

    
    with right_col:
        st.subheader("Your Submission")
        
        # Language selection
        language = st.selectbox(
            "Select Writing Language",
            options=["Arabic", "English"],
            index=0
        )
        
        # Add input method selection
        input_method = st.radio(
            "Choose input method:",
            ["Typing", "Upload Handwritten"],
            horizontal=True
        )
        
        typed_text = None
        uploaded_file = None
        
        if input_method == "Typing":
            # Create container for text input
            text_container = st.container()
            with text_container:
                # Add RTL/LTR direction based on language
                if language == "Arabic":
                    st.markdown(
                        """
                        <style>
                            .stTextArea textarea { 
                                direction: rtl !important;
                                text-align: right !important;
                                font-family: 'Arial', sans-serif !important;
                                font-size: 16px !important;
                            }
                        </style>
                        """,
                        unsafe_allow_html=True
                    )
                # Initialize text input state if not exists
                if "text_input" not in st.session_state:
                    st.session_state.text_input = ""
                typed_text = st.text_area(
                    "Write your answer here",
                    value=st.session_state.text_input,
                    key="text_area",
                    height=150,
                    max_chars=1000,
                    help="Type using your Arabic or English keyboard based on the selected language"
                )
                # Update session state
                st.session_state.text_input = typed_text
                # Add clear text button
                if st.button("Clear Text", key="clear_text"):
                    st.session_state.text_input = ""
                    st.experimental_rerun()
        else:  # Upload Handwritten
            # Add file uploader for handwritten images
            uploaded_file = st.file_uploader(
                "Upload handwritten image",
                type=["png", "jpg", "jpeg"],
                key="image_uploader",
                help="Upload an image of your handwritten text"
            )
            
            if uploaded_file is not None:
                # Display the uploaded image
                st.image(uploaded_file, caption="Uploaded handwritten image", use_column_width=True)
        
        # Submit button
        if st.button("Submit Writing", type="primary", use_container_width=True):
            if input_method == "Typing":
                # Process typed text submission
                if not st.session_state.text_input or st.session_state.text_input.strip() == "":
                    st.error("Please enter your writing before submitting.")
                    return
                
                try:
                    # Save submission for typed text
                    writing_id = save_writing(
                        topic=st.session_state.current_word['english'],
                        content=typed_text,
                        is_image=False,
                        language='ara' if language == "Arabic" else 'eng'
                    )
                    
                    # Generate feedback for the typed text
                    feedback_result = generate_feedback(
                        topic=st.session_state.current_word['english'],
                        content=typed_text,
                        language=language.lower()
                    )
                    
                    # Update feedback in database
                    update_feedback(writing_id, json.dumps(feedback_result))
                    
                    # Display results
                    st.markdown("### Your Writing (Transcribed)")
                    st.text(typed_text)
                    
                    st.markdown("### Target Word")
                    st.markdown(f"<div style='font-size: 24px; direction: rtl;'>{st.session_state.current_word['arabic']}</div>", unsafe_allow_html=True)
                    st.markdown(f"<div>{st.session_state.current_word['english']}</div>", unsafe_allow_html=True)
                    
                    st.markdown("### Grade and Feedback")
                    
                    # Compare transcribed text with target word
                    user_text = typed_text.strip().lower()
                    target_english = st.session_state.current_word['english'].strip().lower()
                    target_arabic = st.session_state.current_word['arabic'].strip().lower()
                    
                    # Check if the answer matches the target word
                    if user_text == target_english or user_text == target_arabic:
                        st.success("✅ CORRECT - Your answer matches the target word!")
                    else:
                        st.error("❌ INCORRECT - Your answer doesn't match the target word.")
                    
                    st.markdown("#### AI Feedback:")
                    if feedback_result and feedback_result.get("success"):
                        st.write(feedback_result.get("feedback"))
                    else:
                        st.error("Could not generate AI feedback.")
                    
                    # Clear input after submission
                    st.session_state.text_input = ""
                
                except Exception as e:
                    st.error(f"Error processing submission: {str(e)}")
                    return
            
            else:  # Upload Handwritten
                # Process uploaded image
                if uploaded_file is None:
                    st.error("Please upload an image before submitting.")
                    return
                
                try:
                    # Read uploaded image
                    image_bytes = uploaded_file.read()
                    img = Image.open(io.BytesIO(image_bytes))
                    img_array = np.array(img)
                    
                    # Convert to grayscale if not already
                    if len(img_array.shape) == 3:
                        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
                    
                    # Process image for OCR
                    img_array = cv2.medianBlur(img_array, 3)  # Remove noise
                    _, img_array = cv2.threshold(img_array, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                    img_array = cv2.copyMakeBorder(img_array, 30, 30, 30, 30, cv2.BORDER_CONSTANT, value=255)
                    img_array = cv2.resize(img_array, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
                    
                    # Convert back to PIL for OCR
                    img = Image.fromarray(img_array)
                    
                    # Perform OCR
                    ocr_text = pytesseract.image_to_string(
                        img,
                        lang='ara' if language == "Arabic" else 'eng',
                        config='--oem 1 --psm 6'
                    ).strip()
                    
                    # Save as PNG for storage
                    img_byte_arr = io.BytesIO()
                    img.save(img_byte_arr, format='PNG')
                    image_data = img_byte_arr.getvalue()
                    
                    # Save submission for image
                    writing_id = save_writing(
                        topic=st.session_state.current_word['english'],
                        content=image_data,
                        is_image=True,
                        language='ara' if language == "Arabic" else 'eng',
                        ocr_text=ocr_text
                    )
                    
                    # Generate feedback for the OCR text
                    feedback_result = generate_feedback(
                        topic=st.session_state.current_word['english'],
                        content=ocr_text,
                        language=language.lower()
                    )
                    
                    # Update the writing entry with feedback
                    update_feedback(writing_id, json.dumps(feedback_result))
                    
                    # Display results
                    st.markdown("### Your Writing (Transcribed)")
                    st.text(ocr_text if ocr_text else "No text could be extracted")
                    
                    st.markdown("### Target Word")
                    st.markdown(f"<div style='font-size: 24px; direction: rtl;'>{st.session_state.current_word['arabic']}</div>", unsafe_allow_html=True)
                    st.markdown(f"<div>{st.session_state.current_word['english']}</div>", unsafe_allow_html=True)
                    
                    st.markdown("### Grade and Feedback")
                    
                    # Compare transcribed text with target word
                    user_text = ocr_text.strip().lower()
                    target_english = st.session_state.current_word['english'].strip().lower()
                    target_arabic = st.session_state.current_word['arabic'].strip().lower()
                    
                    # Check if the answer matches the target word
                    if user_text == target_english or user_text == target_arabic:
                        st.success("✅ CORRECT - Your answer matches the target word!")
                    else:
                        st.error("❌ INCORRECT - Your answer doesn't match the target word.")
                    
                    st.markdown("#### AI Feedback:")
                    if feedback_result and feedback_result.get("success"):
                        st.write(feedback_result.get("feedback"))
                    else:
                        st.error("Could not generate AI feedback.")
                
                except Exception as e:
                    st.error(f"Error processing image: {str(e)}")
                    return
        


def statistics_page():
    st.header("📊 Statistics")
    
    # Get statistics
    stats = get_writing_stats()
    
    # Display metrics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(
            "<div class='stat-card'><div class='stat-number'>{}</div>Total Writings</div>".format(
                stats["total_writings"]
            ),
            unsafe_allow_html=True
        )
    with col2:
        st.markdown(
            "<div class='stat-card'><div class='stat-number'>{}</div>With Feedback</div>".format(
                stats["writings_with_feedback"]
            ),
            unsafe_allow_html=True
        )
    with col3:
        st.markdown(
            "<div class='stat-card'><div class='stat-number'>{}</div>Current Streak</div>".format(
                st.session_state.current_streak
            ),
            unsafe_allow_html=True
        )
    
    # Recent writings
    st.markdown("### Recent Writings")
    recent_writings = get_recent_writings(5)
    for writing in recent_writings:
        with st.expander(f"📝 {writing['topic']} ({writing['created_at'][:10]})"):
            st.markdown("**Content:**")
            st.markdown(f"<div class='arabic-text'>{writing['content']}</div>", unsafe_allow_html=True)
            if writing['feedback']:
                st.markdown("**Feedback:**")
                st.markdown(f"<div class='feedback-box'>{writing['feedback']}</div>", unsafe_allow_html=True)

def settings_page():
    st.header("⚙️ Settings")
    
    config = load_config()
    
    with st.form("settings_form"):
        st.markdown("### Language Settings")
        feedback_language = st.radio(
            "Feedback Language",
            options=["english", "arabic"],
            index=0 if st.session_state.language == "english" else 1,
            format_func=lambda x: "English" if x == "english" else "العربية"
        )
        
        st.markdown("### Difficulty Level")
        difficulty = st.select_slider(
            "Select your proficiency level",
            options=config.get("difficulty_levels", ["Beginner", "Intermediate", "Advanced"]),
            value=config.get("default_difficulty", "Beginner")
        )
        
        if st.form_submit_button("Save Settings"):
            st.session_state.language = feedback_language
            st.success("Settings saved successfully!")

def main():
    # Set page config (must be first Streamlit command)
    st.set_page_config(
        page_title="Arabic Writing Practice",
        page_icon="☪️",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Initialize
    init_db()
    load_css()
    initialize_session_state()
    
    # Sidebar navigation
    with st.sidebar:
        st.title("☪️ Arabic Writing Practice")
        st.markdown("---")
        selected_page = st.radio(
            label="Navigation",
            options=["Practice", "Statistics", "Settings"],
            index=["Practice", "Statistics", "Settings"].index(st.session_state.page),
            label_visibility="collapsed"
        )
        st.session_state.page = selected_page
    
    # Display selected page
    if selected_page == "Practice":
        practice_page()
    elif selected_page == "Statistics":
        statistics_page()
    else:
        settings_page()

if __name__ == "__main__":
    main()
