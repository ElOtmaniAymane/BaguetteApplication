#shared.py
from baguette.bakery.source.types.utils import types, relations, relation_types
from baguette.bakery.source.types import network
from baguette.bakery.source.config import ColorSetting
from baguette.bakery.source.graph import Edge, Arrow
from flask import json

a = types()
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
    if issubclass(cls, Edge):
        edge_list.append(cls)
        # print(f"{cls} is a subclass of Edge")
    else:
        arrow_list.append(cls)
        # print(f"{cls} is a subclass of Arrow")


# issubclass(network.relations.HasSocket, Edge)
# c[0]
# print(arrow_list)
a=relation_types(edge_list[5])
edge_data = []

for c in edge_list:
    a = relation_types(c)

    type_name_a0 = ""
    if hasattr(a[0], "__name__"):
        type_name_a0 = a[0].__name__
    else:
        type_name_a0 = "HHHHH"+str(a[0]).split(".")[-1]

    type_name_a1 = ""
    if hasattr(a[1], "__name__"):
        type_name_a1 = a[1].__name__
    else:
        type_name_a1 = "HHH"+str(a[1]).split(".")[-1]

    edge_data.append([c.__name__, type_name_a0, type_name_a1])
print(edge_data)

