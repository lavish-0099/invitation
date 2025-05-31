const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const addTextBtn = document.getElementById('add-text-btn');
const fontSizeDropdown = document.getElementById('font-size-dropdown');
const changeFontBtn = document.getElementById('change-font-btn');
const changeColorBtn = document.getElementById('change-color-btn');
const slideList = document.getElementById('slide-list');
const saveButton = document.getElementById('saveButton');

let listItems = slideList.querySelectorAll('li');
let currentIndex = 0; 
let selectedTextElement = null; 
let slideMapping = Array.from(slides).map((_, index) => index); 

const updateSlider = () => {
slider.style.transform = `translateX(-${currentIndex * 410}px)`;
};


prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
    updateSlider();
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
    updateSlider();
});

addTextBtn.addEventListener('click', () => {
    const logicalIndex = slideMapping[currentIndex];
    const slide = slides[logicalIndex];
    const newText = document.createElement('div');
    newText.textContent = 'Type here...';
    newText.classList.add('draggable-text');
    newText.style.position = 'absolute';
    newText.style.bottom = '10px';
    newText.style.left = '10px';
    newText.style.color = 'white';
    newText.style.fontSize = '16px';
    newText.style.cursor = 'pointer';
    newText.contentEditable = 'true';

    newText.addEventListener('click', () => {
        selectedTextElement = newText;
    });

    newText.addEventListener('mousedown', (e) => {
        const offsetX = e.offsetX;
        const offsetY = e.offsetY;

        const onMouseMove = (event) => {
            const rect = slide.getBoundingClientRect();
            const slideWidth = rect.width;
            const slideHeight = rect.height;

            let newLeft = event.clientX - rect.left - offsetX;
            let newTop = event.clientY - rect.top - offsetY;

            newLeft = Math.max(0, Math.min(newLeft, slideWidth - newText.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, slideHeight - newText.offsetHeight));

            newText.style.left = `${newLeft}px`;
            newText.style.top = `${newTop}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    slide.appendChild(newText);
    newText.focus();
    saveState(); 
});


fontSizeDropdown.addEventListener('change', (e) => {
const selectedSize = e.target.value; 
if (selectedTextElement) {
    selectedTextElement.style.fontSize = selectedSize; 
} else {
    
}
});


changeFontBtn.addEventListener('click', () => {
if (selectedTextElement) {
    const font = prompt('Enter font family (e.g., Arial, Verdana):');
    if (font) {
    selectedTextElement.style.fontFamily = font; 
    }
} else {
    
}
});


changeColorBtn.addEventListener('click', () => {
if (selectedTextElement) {
    const color = prompt('Enter color (e.g., red, #ff0000):');
    if (color) {
    selectedTextElement.style.color = color; 
    }
} else {
    
}
});

slides.forEach((slide) => {
    slide.setAttribute('draggable', 'true');

    slide.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', Array.from(slides).indexOf(slide));
        slide.classList.add('dragging'); 
    });

    slide.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        const draggingSlide = document.querySelector('.dragging');
        if (draggingSlide && draggingSlide !== slide) {
            const bounding = slide.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            const halfHeight = bounding.height / 2;
            if (offset > halfHeight) {
                slide.after(draggingSlide);
            } else {
                slide.before(draggingSlide);
            }
        }
    });

    slide.addEventListener('drop', () => {
        slide.classList.remove('dragging');
        updateSlidesFromList(); 
    });

    slide.addEventListener('dragend', () => {
        slide.classList.remove('dragging');
    });
});

 
listItems.forEach((item, index) => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', index);
        item.classList.add('dragging'); 
    });

    item.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        const draggingItem = document.querySelector('.dragging');
        if (draggingItem && draggingItem !== item) {
            const bounding = item.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            const halfHeight = bounding.height / 2;
            if (offset > halfHeight) {
                item.after(draggingItem);
            } else {
                item.before(draggingItem);
            }
        }
    });

    item.addEventListener('drop', () => {
        item.classList.remove('dragging'); 
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging'); 
        updateSlidesFromList(); 
    });
});

function updateSlidesFromList() {
    const newOrder = Array.from(slideList.children).map((item) =>
        Array.from(listItems).indexOf(item)
    ); 
    slideMapping = newOrder; 
    const reorderedSlides = newOrder.map((i) => slides[i]);
    slider.innerHTML = '';
    reorderedSlides.forEach((slide) => slider.appendChild(slide));   
    slides = document.querySelectorAll('.slide');
    currentIndex = newOrder.indexOf(currentIndex);
    updateSlider();
}

document.getElementById("saveButton").addEventListener("click", async () => {
    try {
        let slides = document.querySelectorAll('.slide');
        const slideData = [];
  
      slides.forEach((slide, index) => {
        const textElements = slide.querySelectorAll(".draggable-text"); 
        const texts = Array.from(textElements).map((textElement) => ({
          content: textElement.textContent,
          fontSize: textElement.style.fontSize,
          fontFamily: textElement.style.fontFamily,
          color: textElement.style.color,
          position: {
            top: textElement.style.top,
            left: textElement.style.left,
          },
        }));
        slideData.push({ slideNumber: index + 1, texts });
      });
  
      await db.collection("slides").doc("slideData").set({ slides: slideData });
      console.log("Slide data saved successfully!");
      alert("Slides saved to Firestore!");
    } catch (error) {
      console.error("Error saving slide data:", error);
      alert("Failed to save slides. See console for details.");
    }
  });
  
