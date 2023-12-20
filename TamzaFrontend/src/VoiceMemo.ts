export class VoiceMemo{
    
    // nullable
    public id: string;

    public Blob: Blob;

    constructor(id: string, blob: Blob){
        this.id = id;
        this.Blob = blob;
    }

}