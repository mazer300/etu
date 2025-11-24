import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, RegisterData, LoginData } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private apiUrl = 'http://localhost:3001/api';
    private sessionId: string | null = null;

    constructor(private http: HttpClient) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const userData = localStorage.getItem('currentUser');
        const sessionData = localStorage.getItem('sessionId');

        if (userData && sessionData) {
            try {
                const user = JSON.parse(userData);
                this.sessionId = sessionData;
                this.currentUserSubject.next(user);
                console.log('✅ User loaded from storage:', user.name);
            } catch (error) {
                console.error('Error loading user from storage:', error);
                this.clearStorage();
            }
        }
    }

    getAuthHeaders(): HttpHeaders {
        if (this.sessionId) {
            return new HttpHeaders({
                'Authorization': this.sessionId
            });
        }
        return new HttpHeaders();
    }

    register(userData: RegisterData): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/register`, userData)
            .pipe(
                tap(response => {
                    this.sessionId = response.sessionId;
                    const userWithActivity = this.updateUserActivity(response.user);
                    this.currentUserSubject.next(userWithActivity);
                    localStorage.setItem('currentUser', JSON.stringify(userWithActivity));
                    localStorage.setItem('sessionId', response.sessionId);
                    console.log('✅ Registration successful:', userWithActivity.name);
                }),
                catchError(error => {
                    console.error('Registration error:', error);
                    throw error;
                })
            );
    }

    login(loginData: LoginData): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/login`, loginData)
            .pipe(
                tap(response => {
                    this.sessionId = response.sessionId;
                    const userWithActivity = this.updateUserActivity(response.user);
                    this.currentUserSubject.next(userWithActivity);
                    localStorage.setItem('currentUser', JSON.stringify(userWithActivity));
                    localStorage.setItem('sessionId', response.sessionId);
                    console.log('✅ Login successful:', userWithActivity.name);
                }),
                catchError(error => {
                    console.error('Login error:', error);
                    throw error;
                })
            );
    }

    logout(): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers })
            .pipe(
                tap(() => {
                    console.log('✅ Logout successful');
                    this.clearStorage();
                }),
                catchError(error => {
                    console.error('Logout error:', error);
                    this.clearStorage(); // Всегда очищаем хранилище даже при ошибке
                    return of(null);
                })
            );
    }

    private clearStorage(): void {
        this.currentUserSubject.next(null);
        this.sessionId = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionId');
        sessionStorage.clear();
        console.log('✅ Storage cleared');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        const user = this.currentUserSubject.value;
        const session = this.sessionId;

        if (!user || !session) {
            return false;
        }

        return true;
    }

    isAdmin(): boolean {
        return this.currentUserSubject.value?.role === 'admin';
    }

    getSessionId(): string | null {
        return this.sessionId;
    }

    private updateUserActivity(user: User): User {
        return {
            ...user,
            lastActivity: Date.now()
        };
    }

    // Refresh user data from server
    refreshUser(): Observable<User> {
        const headers = this.getAuthHeaders();
        return this.http.get<User>(`${this.apiUrl}/auth/me`, { headers })
            .pipe(
                tap(user => {
                    const userWithActivity = this.updateUserActivity(user);
                    this.currentUserSubject.next(userWithActivity);
                    localStorage.setItem('currentUser', JSON.stringify(userWithActivity));
                }),
                catchError(error => {
                    console.error('Error refreshing user:', error);
                    this.clearStorage();
                    throw error;
                })
            );
    }
}