// just queries all windows on script load
window.onload = function() {
    var tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(tab) {
                tab.setAttribute('aria-selected', 'false');
            });
            this.setAttribute('aria-selected', 'true');

            var contents = document.querySelectorAll('[role="tabpanel"]');
            contents.forEach(function(content) {
                content.style.display = 'none';
            });
            var content = document.querySelector('#content-' + this.id);
            if (content) {
                content.style.display = 'block';
            }
        });
    });

    // makes notepad window draggable
    var draggable = document.querySelector('.draggable');
    var notepadWindow = document.getElementById('draggableWindow'); // Renamed to notepadWindow
    var position = localStorage.getItem('windowPosition');
    if (position) {
        position = JSON.parse(position);
        notepadWindow.style.left = position.left + 'px';
        notepadWindow.style.top = position.top + 'px';
    }

    var mousePosition;
    var offset = [0, 0];
    var isDown = false;

    draggable.addEventListener('mousedown', function(e) {
        isDown = true;
        offset = [
            notepadWindow.offsetLeft - e.clientX,
            notepadWindow.offsetTop - e.clientY
        ];
        draggable.style.cursor = 'move';
    }, true);
    
    document.addEventListener('mouseup', function() {
        isDown = false;
        draggable.style.cursor = 'default';
        localStorage.setItem('windowPosition', JSON.stringify({
            left: notepadWindow.offsetLeft,
            top: notepadWindow.offsetTop
        }));
    }, true);
    
    document.addEventListener('mousemove', function(event) {
        event.preventDefault();
        if (isDown) {
            mousePosition = {
                x : event.clientX,
                y : event.clientY
            };
            notepadWindow.style.left = (mousePosition.x + offset[0]) + 'px';
            notepadWindow.style.top = (mousePosition.y + offset[1]) + 'px';
        }
    }, true);
    
    // Makes notepad window resizable
    var resizeHandle = document.querySelector('.resize-handle');
    var isResizing = false;
    var originalWidth, originalHeight, originalX, originalY;

    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        originalWidth = notepadWindow.offsetWidth;
        originalHeight = notepadWindow.offsetHeight;
        originalX = e.clientX;
        originalY = e.clientY;
        e.preventDefault();
        e.stopPropagation();
    }, true);

    document.addEventListener('mousemove', function(event) {
        if (isResizing) {
            var width = originalWidth + (event.clientX - originalX);
            var height = originalHeight + (event.clientY - originalY);
            
            // Get toolbar width from CSS variable
            var toolbarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--toolbar-width'));
            
            // Enforce minimum width based on toolbar width
            if (width < toolbarWidth) width = toolbarWidth;
            if (height < 100) height = 100;
            
            notepadWindow.style.width = width + 'px';
            notepadWindow.style.height = height + 'px';
            
            // Save size to localStorage
            localStorage.setItem('windowSize', JSON.stringify({
                width: width,
                height: height
            }));
        }
    }, true);

    document.addEventListener('mouseup', function() {
        isResizing = false;
    }, true);

    // Restore window size from localStorage if available
    var size = localStorage.getItem('windowSize');
    if (size) {
        size = JSON.parse(size);
        notepadWindow.style.width = size.width + 'px';
        notepadWindow.style.height = size.height + 'px';
        
        var textarea = document.querySelector('#text20');
        if (textarea) {
            var textareaHeight = size.height - 100;
            if (textareaHeight < 50) textareaHeight = 50;
            textarea.style.height = textareaHeight + 'px';
        }
    }

    //Handles opening and closing of the notepad on the homepage
    var openButton = document.getElementById('openButton');
    var closeButton = document.getElementById('closeButton');
    var draggableWindow = document.getElementById('draggableWindow');

    if (openButton) {
        openButton.disabled = false;

        openButton.addEventListener('click', function() {
            draggableWindow.style.display = 'block';
            openButton.disabled = true;
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', function() {
            draggableWindow.style.display = 'none';
            if (openButton) openButton.disabled = false;
        });
    }

    //Show browser user agent on homepage
    var statusBarField = document.getElementById('browserua');
    if (statusBarField) statusBarField.textContent = navigator.userAgent;

    //Show date and time on homepage
    var dateField = document.getElementById('date');
    if (dateField) {
        setInterval(function() {
            dateField.textContent = new Date().toLocaleString();
        }, 1000);
    }

    // Text formatting controls
    var fontFamilySelect = document.getElementById('fontFamily');
    var fontSizeSelect = document.getElementById('fontSize');
    var textColorInput = document.getElementById('textColor');
    var textArea = document.getElementById('text20');

    // Load saved formatting options
    var savedFormatting = localStorage.getItem('textFormatting');
    if (savedFormatting) {
        savedFormatting = JSON.parse(savedFormatting);
        fontFamilySelect.value = savedFormatting.fontFamily || 'Arial';
        fontSizeSelect.value = savedFormatting.fontSize || '12';
        textColorInput.value = savedFormatting.textColor || '#000000';
        
        applyFormatting();
    }

    // Apply formatting to contenteditable div
    function applyFormatting() {
        textArea.style.fontFamily = fontFamilySelect.value;
        textArea.style.fontSize = fontSizeSelect.value + 'px';
        textArea.style.color = textColorInput.value;
        
        // Save formatting preferences
        localStorage.setItem('textFormatting', JSON.stringify({
            fontFamily: fontFamilySelect.value,
            fontSize: fontSizeSelect.value,
            textColor: textColorInput.value
        }));
    }

    // Format buttons
    var boldButton = document.getElementById('boldButton');
    var italicButton = document.getElementById('italicButton');
    var underlineButton = document.getElementById('underlineButton');

    // Function to apply formatting to selected text using execCommand
    function formatSelectedText(formatType) {
        textArea.focus();
        document.execCommand(formatType, false, null);
        saveContent();
    }

    // Add event listeners to formatting buttons
    if (boldButton) {
        boldButton.addEventListener('click', function() {
            formatSelectedText('bold');
        });
    }

    if (italicButton) {
        italicButton.addEventListener('click', function() {
            formatSelectedText('italic');
        });
    }

    if (underlineButton) {
        underlineButton.addEventListener('click', function() {
            formatSelectedText('underline');
        });
    }

    // Save and restore notepad content
    function saveContent() {
        localStorage.setItem('notepadContent', textArea.innerHTML);
    }

    // Add event listener for content changes
    textArea.addEventListener('input', saveContent);

    // Load saved content
    var savedContent = localStorage.getItem('notepadContent');
    if (savedContent) {
        textArea.innerHTML = savedContent;
    }

    // Add event listeners to font controls to apply formatting when changed
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', function() {
            applyFormatting();
        });
    }

    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', function() {
            applyFormatting();
        });
    }

    if (textColorInput) {
        textColorInput.addEventListener('input', function() {
            applyFormatting();
        });
    }

    // Call applyFormatting initially to set default formatting
    applyFormatting();
};

// Add this function outside of any existing function
function switchToTab(tabId) {
    // Get the tab element
    var targetTab = document.getElementById(tabId);
    
    if (!targetTab) return;
    
    // Deselect all tabs
    var tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach(function(tab) {
        tab.setAttribute('aria-selected', 'false');
    });
    
    // Select the target tab
    targetTab.setAttribute('aria-selected', 'true');
    
    // Hide all content panels
    var contents = document.querySelectorAll('[role="tabpanel"]');
    contents.forEach(function(content) {
        content.style.display = 'none';
    });
    
    // Show the target content panel
    var content = document.querySelector('#content-' + tabId);
    if (content) {
        content.style.display = 'block';
    }
}