import { Component, Input } from '@angular/core';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.less']
})
export class AvatarComponent {
    @Input() user!: User;
    @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

    getInitials(name: string): string {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    }

    onAvatarError(event: any): void {
        const target = event.target;
        target.style.display = 'none';
        const parent = target.parentElement;
        parent.classList.add('default-avatar');
        if (this.user.avatarBlocked) {
            parent.classList.add('blocked-avatar');
        }
        parent.innerHTML = this.getInitials(this.user.name);
    }
}