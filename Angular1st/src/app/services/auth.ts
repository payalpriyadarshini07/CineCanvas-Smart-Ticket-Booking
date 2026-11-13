 import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
fullName: string;
email: string;
password: string;
}

export interface LoginRequest {
email: string;
password: string;
}

export interface UserProfile {
id: number;
fullName: string;
email: string;
role: string;
createdAt?: string;
}

export interface AuthResponse {
token: string;
tokenType: string;
user: UserProfile;
}

export interface UpdateProfileRequest {
fullName: string;
}

@Injectable({
providedIn: 'root'
})
export class AuthService {

private readonly apiUrl = environment.apiUrl;

constructor(private http: HttpClient) {}

private isBrowser(): boolean {
return typeof localStorage !== 'undefined';
}

// Register a new user
register(data: RegisterRequest): Observable<{ message: string }> {
return this.http.post<{ message: string }>(
`${this.apiUrl}/auth/register`,
data
);
}

// Login and save JWT token and user information
login(data: LoginRequest): Observable<AuthResponse> {
return this.http.post<AuthResponse>(
`${this.apiUrl}/auth/login`,
data
).pipe(
tap(response => {
if (this.isBrowser()) {
localStorage.setItem('jwt_token', response.token);
localStorage.setItem(
'user_profile',
JSON.stringify(response.user)
);
}
})
);
}

// Get JWT token
getToken(): string | null {
if (!this.isBrowser()) {
return null;
}


return localStorage.getItem('jwt_token');


}

// Get saved user profile
getCurrentUser(): UserProfile | null {
if (!this.isBrowser()) {
return null;
}

const profile = localStorage.getItem('user_profile');

if (!profile) {
  return null;
}

try {
  return JSON.parse(profile) as UserProfile;
} catch {
  return null;
}


}

// Check login status
isLoggedIn(): boolean {
return !!this.getToken();
}

// Check user role
hasRole(role: string): boolean {
const user = this.getCurrentUser();


return user?.role?.toUpperCase() === role.toUpperCase();

}

isAdmin(): boolean {
return this.hasRole('ADMIN');
}

isCustomer(): boolean {
return this.hasRole('CUSTOMER');
}

// HTTP headers containing the JWT token
getAuthHeaders(): HttpHeaders {
const token = this.getToken();


return new HttpHeaders(
  token
    ? { Authorization: `Bearer ${token}` }
    : {}
);


}

// Load the latest profile from Spring Boot
getProfile(): Observable<UserProfile> {
return this.http.get<UserProfile>(
`${this.apiUrl}/users/me`,
{
headers: this.getAuthHeaders()
}
).pipe(
tap(profile => {
if (this.isBrowser()) {
localStorage.setItem(
'user_profile',
JSON.stringify(profile)
);
}
})
);
}

// Update the user's full name
updateProfile(
data: UpdateProfileRequest
): Observable<UserProfile> {
return this.http.put<UserProfile>(
`${this.apiUrl}/users/me`,
data,
{
headers: this.getAuthHeaders()
}
).pipe(
tap(profile => {
if (this.isBrowser()) {
localStorage.setItem(
'user_profile',
JSON.stringify(profile)
);
}
})
);
}

// Logout
logout(): void {
if (!this.isBrowser()) {
return;
}

localStorage.removeItem('jwt_token');
localStorage.removeItem('user_profile');

}
}