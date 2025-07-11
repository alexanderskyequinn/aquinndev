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

    // Add save functionality
    var saveButton = document.getElementById('saveButton');
    var saveAsButton = document.getElementById('saveAsButton');
    var selectAllButton = document.getElementById('selectAllButton');
    var textArea = document.getElementById('text20');
    
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveNotepadContent();
        });
    }
    
    if (saveAsButton) {
        saveAsButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveNotepadContent(true); // true for "Save As" dialog
        });
    }
    
    if (selectAllButton) {
        selectAllButton.addEventListener('click', function(e) {
            e.preventDefault();
            selectAllText();
        });
    }
    
    function saveNotepadContent(saveAs = false) {
        // Get reference to the textArea
        var textArea = document.getElementById('text20');
        if (!textArea) {
            console.error("Text area not found");
            return;
        }
        
        // Get the content as HTML
        var content = textArea.innerHTML;
        
        // Convert HTML to RTF
        var rtfContent = convertHtmlToRtf(content, textArea);
        
        // Create a filename with current date/time
        var now = new Date();
        var defaultFilename = 'notepad_' + 
            now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + '-' +
            String(now.getMinutes()).padStart(2, '0') + '.rtf';
        
        // Create a hidden link element
        var link = document.createElement('a');
        
        // Create a blob with RTF content
        var blob = new Blob([rtfContent], {type: 'application/rtf'});
        
        // Create a URL for the blob
        link.href = URL.createObjectURL(blob);
        
        // Set filename
        if (saveAs) {
            // For Save As, prompt for filename
            var filename = prompt("Enter filename:", defaultFilename);
            if (!filename) return; // User cancelled
            // Make sure it has .rtf extension
            if (!filename.toLowerCase().endsWith('.rtf')) {
                filename += '.rtf';
            }
            link.download = filename;
        } else {
            link.download = defaultFilename;
        }
        
        // Append to the document
        document.body.appendChild(link);
        
        // Trigger click
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
    
    function selectAllText() {
        if (textArea) {
            // Select all content
            var range = document.createRange();
            range.selectNodeContents(textArea);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
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

function convertHtmlToRtf(html, textArea) {
    // RTF Header
    let rtf = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033';
    
    // Font table - define the fonts we support
    rtf += '{\\fonttbl';
    rtf += '{\\f0\\fnil\\fcharset0 Arial;}';
    rtf += '{\\f1\\fnil\\fcharset0 Times New Roman;}';
    rtf += '{\\f2\\fnil\\fcharset0 Courier New;}';
    rtf += '{\\f3\\fnil\\fcharset0 Comic Sans MS;}';
    rtf += '{\\f4\\fnil\\fcharset0 Impact;}';
    rtf += '}';
    
    // Color table
    let colorTable = [
        {r: 0, g: 0, b: 0},      // Black (default)
        {r: 255, g: 0, b: 0},    // Red
        {r: 0, g: 0, b: 255},    // Blue
    ];
    
    // Get the base styles from the textArea
    let baseStyle = window.getComputedStyle(textArea);
    let baseColor = parseRgbColor(baseStyle.color);
    if (baseColor && !findColorInTable(baseColor, colorTable)) {
        colorTable.push(baseColor);
    }
    
    // Create a temporary div to parse HTML
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // First pass: collect all colors from the document
    collectColors(tempDiv);
    
    // Generate the color table
    rtf += '{\\colortbl;'; // First entry is always empty
    for (let i = 0; i < colorTable.length; i++) {
        let color = colorTable[i];
        rtf += `\\red${color.r}\\green${color.g}\\blue${color.b};`;
    }
    rtf += '}';
    
    // Default paragraph formatting
    rtf += '\\pard\\plain';
    
    // Start with default formatting from the editor
    let defaultFontIndex = getFontIndex(baseStyle.fontFamily);
    let defaultFontSize = Math.round(parseFloat(baseStyle.fontSize) * 2); // Convert to half-points
    let defaultColorIndex = findColorIndex(baseColor, colorTable);
    
    rtf += `\\f${defaultFontIndex}\\fs${defaultFontSize}\\cf${defaultColorIndex} `;
    
    // Process the content
    rtf += processNode(tempDiv, {
        fontFamily: baseStyle.fontFamily,
        fontSize: parseFloat(baseStyle.fontSize),
        color: baseColor,
        bold: false,
        italic: false,
        underline: false
    });
    
    // End the RTF document
    rtf += '}';
    
    return rtf;
    
    // Function to collect all colors used in the document
    function collectColors(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for color attribute or style
            let color = null;
            
            // Check inline style first
            if (node.style && node.style.color) {
                color = parseRgbColor(node.style.color);
            }
            
            // If no inline style, check computed style
            if (!color) {
                let style = window.getComputedStyle(node);
                color = parseRgbColor(style.color);
            }
            
            // Add color to table if not already present
            if (color && !findColorInTable(color, colorTable)) {
                colorTable.push(color);
            }
            
            // Process child nodes
            Array.from(node.childNodes).forEach(child => collectColors(child));
        }
    }
    
    // Convert color object to string for mapping
    function colorToString(color) {
        return `${color.r},${color.g},${color.b}`;
    }
    
    // Find if color exists in the table
    function findColorInTable(color, table) {
        return table.some(c => c.r === color.r && c.g === color.g && c.b === color.b);
    }
    
    // Get color index from table
    function findColorIndex(color, table) {
        if (!color) return 1; // Default to black (index 1)
        
        for (let i = 0; i < table.length; i++) {
            if (table[i].r === color.r && 
                table[i].g === color.g && 
                table[i].b === color.b) {
                return i + 1; // RTF indices start at 1
            }
        }
        return 1; // Default to black if not found
    }
    
    // Get font family index
    function getFontIndex(fontFamily) {
        let font = fontFamily.toLowerCase();
        if (font.includes('times')) return 1;
        if (font.includes('courier')) return 2;
        if (font.includes('comic')) return 3;
        if (font.includes('impact')) return 4;
        return 0; // Default to Arial
    }
    
    // Parse RGB color
    function parseRgbColor(rgb) {
        if (!rgb) return null;
        
        // Handle hex format
        if (rgb.startsWith('#')) {
            let hex = rgb.substring(1);
            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
            };
        }
        
        // Handle rgb format
        let match = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
        
        return null;
    }
    
    // Process node and its children recursively with inherited formatting
    function processNode(node, inheritedFormat) {
        let result = '';
        
        if (node.nodeType === Node.TEXT_NODE) {
            // Escape special RTF characters
            let text = node.textContent
                .replace(/\\/g, '\\\\')
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}')
                .replace(/\n/g, '\\par\n');
                
            return text;
        }
        else if (node.nodeType === Node.ELEMENT_NODE) {
            // Create new format object based on inherited format and current element
            let currentFormat = Object.assign({}, inheritedFormat);
            let hasFormatChange = false;
            
            // Check for formatting based on element type
            let tagName = node.tagName.toLowerCase();
            if (tagName === 'b' || tagName === 'strong') {
                currentFormat.bold = true;
                hasFormatChange = true;
            }
            if (tagName === 'i' || tagName === 'em') {
                currentFormat.italic = true;
                hasFormatChange = true;
            }
            if (tagName === 'u') {
                currentFormat.underline = true;
                hasFormatChange = true;
            }
            
            // Check for inline styles
            if (node.style) {
                if (node.style.fontFamily) {
                    currentFormat.fontFamily = node.style.fontFamily;
                    hasFormatChange = true;
                }
                if (node.style.fontSize) {
                    currentFormat.fontSize = parseFloat(node.style.fontSize);
                    hasFormatChange = true;
                }
                if (node.style.color) {
                    currentFormat.color = parseRgbColor(node.style.color);
                    hasFormatChange = true;
                }
                if (node.style.fontWeight === 'bold' || parseInt(node.style.fontWeight) >= 700) {
                    currentFormat.bold = true;
                    hasFormatChange = true;
                }
                if (node.style.fontStyle === 'italic') {
                    currentFormat.italic = true;
                    hasFormatChange = true;
                }
                if (node.style.textDecoration && node.style.textDecoration.includes('underline')) {
                    currentFormat.underline = true;
                    hasFormatChange = true;
                }
            }
            
            // Only add formatting group if there's actual text content
            let hasTextContent = node.textContent.trim().length > 0;
            
            if (hasFormatChange && hasTextContent) {
                result += '{'; // Start formatting group
                
                // Apply font family
                let fontIndex = getFontIndex(currentFormat.fontFamily);
                result += `\\f${fontIndex}`;
                
                // Apply font size (in half-points)
                result += `\\fs${Math.round(currentFormat.fontSize * 2)}`;
                
                // Apply color
                if (currentFormat.color) {
                    let colorIndex = findColorIndex(currentFormat.color, colorTable);
                    result += `\\cf${colorIndex}`;
                }
                
                // Apply bold/italic/underline
                if (currentFormat.bold) result += '\\b';
                if (currentFormat.italic) result += '\\i';
                if (currentFormat.underline) result += '\\ul';
                
                // Add space to separate formatting from content
                result += ' ';
            }
            
            // Process all child nodes with current format
            Array.from(node.childNodes).forEach(child => {
                result += processNode(child, currentFormat);
            });
            
            // Close formatting group if we opened one
            if (hasFormatChange && hasTextContent) {
                // Turn off formatting that was applied
                if (currentFormat.bold && !inheritedFormat.bold) result += '\\b0';
                if (currentFormat.italic && !inheritedFormat.italic) result += '\\i0';
                if (currentFormat.underline && !inheritedFormat.underline) result += '\\ul0';
                
                result += '}'; // End formatting group
            }
        }
        
        return result;
    }
}