export interface Modal {
    type: 'warning' | 'alert';
    title: string;
    message: string;
    options: string[];
}
