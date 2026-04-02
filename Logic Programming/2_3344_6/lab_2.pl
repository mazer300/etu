% Лабораторная работа №2
% Вариант 6

% Задание 1. Списки:
% 6. Найти все отрицательные элементы в исходном числовом списке.
% ?- pos_list_elem([1,-2,3,-4,-5,6], X).
% X = [-2,-4,-5]

pos_list_elem([], []).
pos_list_elem([Head|Tail], [Head|Result]) :-
	Head < 0,
	pos_list_elem(Tail, Result).

pos_list_elem([Head|Tail], Result) :-
	Head >= 0,
	pos_list_elem(Tail, Result).


% [Задание 2, Деревья]:
% 6. Реализуйте предикат, возвращающий путь от корня до заданного уникального элемента в бинарном дереве.
% ?- findTreePath(tr(5, tr(4, nil, nil), tr(8, tr(6, tr(3, nil, nil), nil), tr(9, nil, nil))), 3, X).
% X = [5,8,6,3]

findTreePath(tr(Element, _, _), Element, [Element]).

findTreePath(tr(X, Left, Right), Element, [X|Path]) :-
	(findTreePath(Left, Element, Path); findTreePath(Right, Element, Path)).
