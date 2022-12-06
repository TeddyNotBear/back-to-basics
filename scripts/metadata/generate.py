import json
from datetime import datetime
import uuid

def generateMetada(dna, id, date):
    metadata = {
        "dna": dna,
        "name": "Garden Collection #" + str(id),
        "description": "First Garden Collection on Polygon",
        "image": "ipfs//QmUJrYLXB81sgZmtpvDwXwLiwX7FiNd189CtBDxLmguAjE/" + str(id) + ".jpg",
        "date": date,
        "attributes" : [
            {
                "trait_value": "DUCK",
                "value": 3
            },
            {
                "trait_value": "TREE",
                "value": 2
            },
            {
                "trait_value": "TRASH",
                "value": "Brown"
            }
        ]
    }

    json_metadata = json.dumps(metadata, indent=4)
    with open('./scripts/metadata/json/' + str(id) + '.json', 'w') as jsonFile:
        jsonFile.write(json_metadata)
        jsonFile.close()

def main():
    dt = datetime.now()
    ts = datetime.timestamp(dt)
    for _ in(i for i in range(1, 10, 1)):
        generateMetada(uuid.uuid4().hex, _, ts)

main()