% Лабораторная работа №3
% Группа: 3344
% Вариант 6. Помощник кинолога.
% Имеется набор фактов (признаков) и пород собак, обладающих этими признаками.
% Требуется задать пользователю вопросы с вариантами ответов да/ нет - чтобы угадать какую породу собаки (из представленных) он загадал.

:- dynamic(otvet_polzovatelya/2).   % кэш ответов: ответ_пользователя(Признак, Ответ)
:- dynamic(kandidat/1).             % текущий список пород-кандидатов

% Загрузка базы знаний
zagruzit_bazu :-
	(   file_exists('knowledge_base.pl') -> 
		consult('knowledge_base.pl'),
		write('Baza znaniy zagruzhena.'), nl
	;   write('Oshibka: fayl bazy znaniy ne nayden!'), nl,
		fail
	).

% Основной предикат запуска
nachat :-
    retractall(otvet_polzovatelya(_,_)),
    retractall(kandidat(_)),
    zagruzit_bazu,
    write('Dobro pozhalovat v pomoshnik kinologa!'), nl,
    write('Zagadayte odnu iz porod sobak iz bazy.'), nl,
    write('Ya budu zadavat voprosy o priznakah, otvechayte "da" ili "net".'), nl, nl,
    % Инициализация списка кандидатов всеми породами
    forall(poroda(P), assertz(kandidat(P))),
    ugadat_porodu.

% Основной цикл угадывания
ugadat_porodu :-
    % Проверяем, осталась ли одна порода
    findall(P, kandidat(P), Spisok),
    length(Spisok, Dlina),
    (   Dlina =:= 0 ->
        write('K sozhaleniyu, ni odna poroda ne podhodit pod ukazannye priznaki.'), nl,
        write('Vozmozhno, ya chego-to ne znayu. Poprobuyte snova.'), nl
    ;   Dlina =:= 1 ->
        [Poroda] = Spisok,
        format('Ya dumayu, vy zagadali porodu: ~w~n', [Poroda]),
        write('Eto verno? (da/net) '),
        read(Otvet),
        (   Otvet == da ->
            write('Ura! Ya ugadal!'), nl
        ;   write('Zhal. Vozmozhno, u menya nedostatochno informacii.'), nl
        )
    ;   % Иначе выбираем следующий признак и задаём вопрос
        vybrat_priznak(Priznak),
        (   Priznak = none ->
            write('Pod ukazannye priznaki podhodit neskolko porod. Budu sprasivat po odnoj.'), nl,
            perebirat_kandidatov(Spisok)
        ;   zadat_vopros(Priznak, Otvet),
            assertz(otvet_polzovatelya(Priznak, Otvet)),
            filtrovat_kandidatov(Priznak, Otvet),
            ugadat_porodu
        )
    ).

% Выбор признака
vybrat_priznak(Priznak) :-
    findall(Pr,
        (kandidat(P), priznak(P, Pr), \+ otvet_polzovatelya(Pr, _)),
        L
    ),
    sort(L, U),
    (   U = [Priznak|_]
    ->  true
    ;   Priznak = none
    ).


% Задать вопрос пользователю о признаке
zadat_vopros(Priznak, Otvet) :-
    format('Obladaet li sobaka priznakom "~w"? (da/net) ', [Priznak]),
    read(Vvod),
    (   (Vvod == da; Vvod == net) ->
        Otvet = Vvod
    ;   write('Pozhaluysta, vvedite "da" ili "net".'), nl,
        zadat_vopros(Priznak, Otvet)
    ).

% Фильтрация кандидатов в зависимости от ответа
filtrovat_kandidatov(Priznak, da) :-
    findall(P,
        (kandidat(P), priznak(P, Priznak)),
        Keep
    ),
    retractall(kandidat(_)),
    forall(member(P, Keep), assertz(kandidat(P))).

filtrovat_kandidatov(Priznak, net) :-
    findall(P,
        (kandidat(P), \+ priznak(P, Priznak)),
        Keep
    ),
    retractall(kandidat(_)),
    forall(member(P, Keep), assertz(kandidat(P))).

perebirat_kandidatov([]) :-
    write('Zhal. Vozmozhno, u menya nedostatochno informacii.'), nl.

perebirat_kandidatov([Poroda|Hvost]) :-
    format('Vy zagadali porodu "~w"? (da/net) ', [Poroda]),
    read(Otvet),
    (   Otvet == da ->
        write('Ura! Ya ugadal!'), nl
    ;   perebirat_kandidatov(Hvost)
    ).

% Для удобства можно перезапустить с очисткой
perezapusk :-
    retractall(otvet_polzovatelya(_,_)),
    retractall(kandidat(_)),
    nachat.

:- initialization(nachat).