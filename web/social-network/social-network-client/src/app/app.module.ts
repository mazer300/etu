import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';
import { AddPostComponent } from './components/add-post/add-post.component';
import { FriendsComponent } from './components/friends/friends.component';
import { ChatComponent } from './components/chat/chat.component';
import { AvatarComponent } from './components/avatar/avatar.component';

// Импортируем сервисы и guard
import { AuthGuard } from './guards/auth.guard';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { WebsocketService } from './services/websocket.service';

const routes: Routes = [
    { path: 'register', component: RegistrationComponent },
    { path: 'login', component: LoginComponent },
    { path: 'news', component: NewsFeedComponent, canActivate: [AuthGuard] },
    { path: 'add-post', component: AddPostComponent, canActivate: [AuthGuard] },
    { path: 'friends', component: FriendsComponent, canActivate: [AuthGuard] },
    { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/news', pathMatch: 'full' },
    { path: '**', redirectTo: '/news' }
];

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        RegistrationComponent,
        LoginComponent,
        NewsFeedComponent,
        AddPostComponent,
        FriendsComponent,
        ChatComponent,
        AvatarComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule.forRoot(routes, { useHash: false })
    ],
    providers: [
        AuthGuard,
        ApiService,
        AuthService,
        WebsocketService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }