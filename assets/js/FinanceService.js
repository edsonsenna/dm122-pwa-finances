let db;

export default class FinanceService {

    constructor() {
        this.initializeDB();
    }

    initializeDB() {
        db = new Dexie('financeDB');

        db.version(1).stores({
            finances: '++id, type, value, createAt'
        });
    }

    getAll() {
        return db.finances.toArray();
    }

    get(id) {
        return db.finances.get(id);
    }

    save(task) {
        return db.finances.put(task);
    }

    delete(id) {
        return db.finances.delete(id);
    }
}