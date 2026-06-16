import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile(r'D:\Nimble\NIMBLE\nimble_team_roles (1).docx') as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    text = ''.join(node.text for node in tree.iter() if node.text)
    
with open(r'D:\Nimble\NIMBLE\doc_text.txt', 'w', encoding='utf-8') as f:
    f.write(text)
