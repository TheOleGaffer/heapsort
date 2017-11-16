import os
import csv
import sys
import requests

if sys.argv[1] == 'help' or sys.argv[1] == '--help' or sys.argv[1] == '-h':
    print(f'''
        First arg: Bucket to put stuff into.\n
        Second arg: File of a bunch of "random numbers", one on each line.\n
        Third arg: Solr URL (including /solr extension).\n
        Fourth arg: Solr core name from which to get classification information, etc. (ex. IllumDocuments).\n
        Fifth arg: Project to import into.\n
        Ex. python {__file__} aaa3 mrns.txt http://localhost:8983/solr IllumDocuments aaa''')
    exit(0)

if len(sys.argv) != 6:
    print('Not enough args you nincompoop')
    exit(1)

bucket = sys.argv[1]
file_name = sys.argv[2]
solr_location = sys.argv[3]
solr_query_core_name = sys.argv[4]
project = sys.argv[5]
solr_rad_core = "illuminate"
solr_note_core = "notes"
solr_prod_location = "http://illum-index-prod:8080/solr"
# solr_prod_location = "http://10.7.0.76:8983/solr"

with open(file_name) as file:
    mrn_list = file.readlines()
    mrn_list = [_.strip() for _ in mrn_list]

doc_list = []
for mrn in mrn_list:
    resp = requests.get(f"{solr_location}/{solr_query_core_name}/select?q=mrn:{mrn} AND aaa_classification:positive").json()
    docs = resp.get('response').get('docs')
    for doc in docs:
        if doc.get('mod') == "Note":
            resp = requests.get(f"{solr_prod_location}/{solr_note_core}/select?q=id:{doc.get('id')}&wt=json").json()
            original_doc = resp.get('response').get('docs')[0]
            doc["acc"] = original_doc.get("noteid")
            doc["gender"] = original_doc.get("gender")
            doc["report_text"] = original_doc.get("report_text")
        else:
            resp = requests.get(f"{solr_prod_location}/{solr_rad_core}/select?q=id:{doc.get('id')}&wt=json").json()
            original_doc = resp.get('response').get('docs')[0]
            doc["report_text"] = original_doc.get("report_text")
            doc["gender"] = original_doc.get("gender")
        doc.pop('aaa_findings_negative_sentence_count', None)
        doc.pop('aaa_impression_negative_sentence_count', None)
        doc.pop('aaa_other_negative_sentence_count', None)
        doc.pop('completeddate', None)
        doc.pop('state', None)
        doc.pop('aaa_history_negative_sentence_count', None)
        doc_list.append(doc)


with open('temp.csv', 'w', encoding='utf-8') as output_file:
    keys = list(doc_list[0].keys())
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(doc_list)

s = requests.session()
s.verify = False
s.auth = ('discovery', 'newIlluminate')
with open('temp.csv') as file:
    files = {'csvFile': file}
    resp = s.post(f'http://localhost:9400/discovery/{project}/external_import', files=files, data={'bucket': bucket})
    print(resp.text)

os.remove('temp.csv')