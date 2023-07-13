# from baguette.croutons.metalib.utils import import_env, entries, save, load
# from baguette.croutons.source.metagraph import MetaGraph, MetaArrow, MetaEdge, MetaVertex
# import requests
# from shared import type_dictionary, arrow_dictionary, edge_dictionary
# import baguette
# MG = MetaGraph() 
# MG.file = MetaVertex[type_dictionary['File']] 
# MG.diff = MetaVertex[type_dictionary['Data']]
# MG.writes = MetaEdge(MG.file, MG.diff)[baguette.bakery.source.types.data.relations.HasSimilarContent]   # Edge between them
# save(MG, "HE-writing")
# # print(entries())
# # print(type_dictionnary['Data'])
# digit_mapping = {
#         "0": "zero",
#         "1": "one",
#         "2": "two",
#         "3": "three",
#         "4": "four",
#         "5": "five",
#         "6": "six",
#         "7": "seven",
#         "8": "eight",
#         "9": "nine"
#     }

# def convert_number_to_words(number, prefix):    
#     return prefix + "".join(digit_mapping.get(digit, digit) for digit in str(number))
# def create_metagraph(user_id):
#     MG = MetaGraph()  # Crée un MetaGraph vide
#     response = requests.get(f"https://localhost/8001/api/users/export/{user_id}")
#     data = response.json()
#     for node in data:
#         node_id = node["node_id"]
#         node_type = node["node_type"]
#         node_name = convert_number_to_words(node["node_id"], "")
        
#         # Crée un nouveau vertex avec le type de nœud correspondant au dictionnaire
#         MG.node_name = MetaVertex[type_dictionary[node_type]]
#     for node in data:
#         outgoing_edges = node.get("outgoing_edges", [])
#         for edge in outgoing_edges:
#             arrow = edge["arrow"]
#             edge_id = edge["edge_id"]
#             edge_type = edge["edge_type"]
#             source_node_id = edge["source_node_id"]
#             target_node_id = edge["target_node_id"]

#             # Récupère les noms des vertices source et cible
#             source_vertex_name = convert_number_to_words(source_node_id, "")
#             target_vertex_name = convert_number_to_words(target_node_id, "")
#             # Crée une nouvelle arête avec le type d'arête correspondant au dictionnaire
#             if arrow == 0:
#                 edge_name = convert_number_to_words(edge_id, "Edge")
#                 MG.edge_name = MetaEdge[edge_dictionary[edge_type]]
#             else:
#                 edge_name = convert_number_to_words(edge_id, "Edge")
#                 MG.edge_name = MetaArrow[arrow_dictionary[edge_type]]

#     return MG


# Metag = create_metagraph(1)
# save(MG, "extractions")
# print(load("extractions"))
# # Exemple d'utilisation

