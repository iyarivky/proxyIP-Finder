import os
import json
from shutil import copyfile

# Fungsi untuk membaca dan menulis data dari file JSON ke file teks
def convert_json_to_txt(json_file_path, output_folder):
    # Baca data dari file JSON
    with open(json_file_path, 'r') as json_file:
        data = json.load(json_file)

    # Dapatkan nama file tanpa ekstensi
    filename = os.path.splitext(os.path.basename(json_file_path))[0]

    # Buat path untuk file teks hasil konversi
    txt_file_path = os.path.join(output_folder, f"{filename}.txt")

    # Tulis data ke file teks
    with open(txt_file_path, 'w') as txt_file:
        for ip_address in data:
            txt_file.write(ip_address + '\n')

# Folder asal dan tujuan
source_folder = 'asnpool-ID'
output_folder = 'asnpool-ID-text'

# Pastikan folder tujuan ada, jika belum, buat folder tersebut
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Iterasi semua file dalam folder sumber
for root, dirs, files in os.walk(source_folder):
    for file in files:
        if file.endswith('.json'):
            # Buat path lengkap ke file JSON
            json_file_path = os.path.join(root, file)
            # Konversi file JSON ke file teks
            convert_json_to_txt(json_file_path, output_folder)
            print(f"Converted {json_file_path}")

print("Conversion complete.")