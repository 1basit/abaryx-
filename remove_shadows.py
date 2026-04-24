import re

def remove_shadows(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return
        
    # Replace standard CSS rules
    content = re.sub(r'box-shadow:\s*[^;]+;', 'box-shadow: none;', content)
    content = re.sub(r'text-shadow:\s*[^;]+;', 'text-shadow: none;', content)
    content = re.sub(r'filter:\s*drop-shadow\([^)]+\);', 'filter: none;', content)
    
    # Replace inline styles without ending semicolon
    content = re.sub(r'box-shadow:\s*[^;\x22]*?(?=[\x22;])', 'box-shadow: none', content)
    content = re.sub(r'text-shadow:\s*[^;\x22]*?(?=[\x22;])', 'text-shadow: none', content)
    content = re.sub(r'filter:\s*drop-shadow\([^)]+\)', 'filter: none', content)

    # JS inline assignment replacement: this.style.boxShadow='...'
    content = re.sub(r'this\.style\.boxShadow=\x27[^\x27]+\x27', 'this.style.boxShadow=\x27none\x27', content)
    content = re.sub(r'this\.style\.textShadow=\x27[^\x27]+\x27', 'this.style.textShadow=\x27none\x27', content)
    
    # Glow animation names
    content = content.replace('shadow-glow-', 'shadow-no-glow-')
    content = content.replace('box-shadow: var(--shadow-glow-cyan);', '')
    content = content.replace('box-shadow: var(--shadow-glow-violet);', '')
    content = content.replace('box-shadow: var(--shadow-glow-magenta);', '')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

remove_shadows('styles.css')
remove_shadows('index.html')
print("Shadows removed")
