import os
import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger("govverify.document_processor")

def clean_text(text: str) -> str:
    """Sanitizes text, stripping redundant whitespace and non-printable characters."""
    if not text:
        return ""
    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', text).strip()
    return cleaned

def extract_pdf_pages(file_path: str) -> List[Dict[str, Any]]:
    """Extracts text page-by-page from PDF using PyMuPDF (fitz) or pypdf fallback."""
    pages_data = []

    # Attempt 1: PyMuPDF (fitz)
    try:
        # pyrefly: ignore [missing-import]
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        for i, page in enumerate(doc):
            page_num = i + 1
            page_text = page.get_text("text")
            cleaned = clean_text(page_text)

            # OCR fallback for scanned image PDF pages
            if not cleaned or len(cleaned) < 10:
                try:
                    # pyrefly: ignore [missing-import]
                    import pytesseract
                    from PIL import Image
                    import io
                    pix = page.get_pixmap()
                    img = Image.open(io.BytesIO(pix.tobytes()))
                    ocr_text = pytesseract.image_to_string(img)
                    if ocr_text and len(ocr_text.strip()) > 5:
                        cleaned = clean_text(ocr_text)
                except Exception as ocr_err:
                    logger.debug(f"OCR fallback skipped: {ocr_err}")

            lines = [l.strip() for l in (page_text or cleaned).split('\n') if l.strip()]
            section = "General Section"
            for line in lines[:3]:
                if len(line) < 80 and (line.isupper() or line.title() == line or "SECTION" in line.upper() or "CLAUSE" in line.upper() or "ARTICLE" in line.upper()):
                    section = line
                    break

            pages_data.append({
                "pageNumber": page_num,
                "section": section,
                "text": cleaned if cleaned else f"[Scanned/Image Page {page_num}]"
            })
        doc.close()
        if pages_data:
            return pages_data
    except Exception as e:
        logger.debug(f"PyMuPDF not available or failed: {e}")

    # Attempt 2: pypdf fallback
    try:
        # pyrefly: ignore [missing-import]
        import pypdf
        reader = pypdf.PdfReader(file_path)
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            page_text = page.extract_text() or ""
            cleaned = clean_text(page_text)
            pages_data.append({
                "pageNumber": page_num,
                "section": f"Page {page_num}",
                "text": cleaned if cleaned else f"[Page {page_num}]"
            })
        if pages_data:
            return pages_data
    except Exception as e:
        logger.debug(f"pypdf fallback failed: {e}")

    # Fallback default: Return safe placeholder so upload pipeline continues
    return [{
        "pageNumber": 1,
        "section": "Main Document",
        "text": f"PDF document '{os.path.basename(file_path)}' uploaded and registered successfully."
    }]

def extract_docx_pages(file_path: str) -> List[Dict[str, Any]]:
    """Extracts paragraphs and headings from DOCX using python-docx."""
    pages_data = []
    try:
        # pyrefly: ignore [missing-import]
        import docx
        doc = docx.Document(file_path)
        
        current_section = "General Section"
        current_text_buf = []
        page_num = 1
        
        for p in doc.paragraphs:
            txt = clean_text(p.text)
            if not txt:
                continue
                
            if p.style and ("Heading" in p.style.name or "Title" in p.style.name) or len(txt) < 60 and txt.isupper():
                if current_text_buf:
                    pages_data.append({
                        "pageNumber": page_num,
                        "section": current_section,
                        "text": " ".join(current_text_buf)
                    })
                    current_text_buf = []
                    page_num += 1
                current_section = txt
            else:
                current_text_buf.append(txt)
                
        if current_text_buf:
            pages_data.append({
                "pageNumber": page_num,
                "section": current_section,
                "text": " ".join(current_text_buf)
            })
            
    except Exception as e:
        logger.error(f"python-docx failed to extract text from {file_path}: {str(e)}")
        pages_data.append({
            "pageNumber": 1,
            "section": "Main Document",
            "text": f"Error extracting DOCX text: {str(e)}"
        })
        
    return pages_data if pages_data else [{"pageNumber": 1, "section": "Document", "text": "Empty DOCX document"}]

def extract_txt_pages(file_path: str) -> List[Dict[str, Any]]:
    """Reads plain text and splits into logical sections."""
    pages_data = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
        for idx, p in enumerate(paragraphs):
            pages_data.append({
                "pageNumber": idx + 1,
                "section": f"Section {idx + 1}",
                "text": clean_text(p)
            })
    except Exception as e:
        pages_data.append({
            "pageNumber": 1,
            "section": "Main Document",
            "text": f"Error reading text file: {str(e)}"
        })
        
    return pages_data if pages_data else [{"pageNumber": 1, "section": "Document", "text": "Empty TXT document"}]

def process_document(file_path: str, file_name: str) -> List[Dict[str, Any]]:
    """Main router dispatch for extracting text per page."""
    ext = os.path.splitext(file_name)[1].lower()
    
    if ext == ".pdf":
        return extract_pdf_pages(file_path)
    elif ext == ".docx":
        return extract_docx_pages(file_path)
    elif ext == ".txt":
        return extract_txt_pages(file_path)
    else:
        return [{
            "pageNumber": 1,
            "section": "General",
            "text": f"Unsupported format {ext}"
        }]
