/* Лабораторная работа №1 */
/* Вариант 6 (внучка, золовка (сестра мужа))*/

/* Отношения из задания */
parent(tom, bob).
parent(ann, bob).
parent(tom, liza).
parent(bob, mary).
parent(bob, luk).
parent(luk, kate).

/* Дополнение к отношениям */
parent(peter, alex).
parent(anna, alex).
parent(anna, nastya).
parent(igor, katya).
parent(elena, katya).
parent(dmitry, sofia).
parent(olga, sofia).
parent(dmitry, vasya).

/* Отношения из задания */
male(tom).
male(bob).
male(luk).

/* Дополнение к отношениям */
male(peter).
male(alex).
male(igor).
male(dmitry).
male(vasya).

female(kate).
female(liza).
female(mary).

female(ann).

/* Дополнение к отношениям */
female(anna).
female(katya).
female(elena).
female(sofia).
female(olga).
female(nastya).

married(peter, anna).
married(bob, katya).
married(luk, sofia).
married(alex, kate). 

/* Внучка */
child(X,Y):- parent(Y,X), X\=Y.
grandchild(X,Y):- child(X,Z), child(Z,Y), X\=Y.
granddaugher(X,Y):- grandchild(X,Y), female(X), X\=Y.

/* Золовка (сестра мужа) */
sister(X,Y):- female(X), parent(F,X), parent(F,Y), X\=Y.
husband(X,Y):- male(X), female(Y), (married(X,Y); married(Y,X)), X\=Y.
husbands_sister(X,Y):- sister(X,Z), husband(Z,Y), X\=Y.