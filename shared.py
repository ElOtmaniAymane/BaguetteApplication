#shared.py
from datetime import timedelta
import datetime
import typing
import types as ftypes
from typing import Union, get_args
import requests
from flask import json
from baguette.bakery.source.types.utils import types as ltypes, relations, relation_types
from baguette.bakery.source import types 

from baguette.bakery.source.types import network, filesystem
from baguette.bakery.source.config import ColorSetting
from baguette.bakery.source.graph import Edge, Arrow
from flask import json

# import_env(globals)
a = ltypes()
type_dictionary = {element.__name__: element for element in a}
# print(a)
b = [(element.__name__, element.default_color) for element in a]
# print(b)
type_color_dict = {name: (color.R, color.G, color.B) for name, color in b}
type_color_json = json.dumps(type_color_dict)
# print(type_color_json)
# for (cls, name), color in ColorSetting.list().items():
#     print(cls, name, color.value)
c = relations()
# print(c)
edge_list=[]
arrow_list=[]

for cls in c:
    if issubclass(cls, Arrow):
        arrow_list.append(cls)
        # print(f"{cls} is a subclass of Edge " + str(i))
    
    edge_list.append(cls)
    
arrow_dictionary = {element.__name__ : element for element in arrow_list}
edge_dictionary = {element.__name__ : element for element in edge_list}

# issubclass(network.relations.HasSocket, Edge)
# c[0]
# print(edge_list)
a=relation_types(filesystem.relations.Contains)
# print(a)

def get_type_name(obj):
    if isinstance(obj, ftypes.UnionType):
        # Cas où l'objet est une UnionType
        type_names = [get_type_name(t) for t in obj.__args__]
        return ' | '.join(type_names)
    else:
        # Cas général où on récupère le nom du type
        return obj.__name__

edge_data = []
arrow_data = []
for c in edge_list:
    a = relation_types(c)
    edge_data.append([c.__name__, get_type_name(a[0]), get_type_name(a[1])])

for c in arrow_list:
    a = relation_types(c)
    arrow_data.append([c.__name__, get_type_name(a[0]), get_type_name(a[1])])
# print(edge_data)

c = [element.__name__ for element in ltypes()]
# print(arrow_dictionnary)