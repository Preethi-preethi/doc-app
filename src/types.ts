export interface FileData {
    path: string;
    name: string;
    content: string;
    size: number;
}

export interface ComponentResult {
    name: string;
    description: string;
    methods?: string[];
    props?: string[];
}

export interface AnalysisResult {
    frontend?: string;
    backend?: string;
    database?: string;
    architecture?: string;
}
