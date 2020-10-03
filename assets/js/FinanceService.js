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
        
        db.on('populate', async () => {
            console.log('It runs only once!');
            await db.finances.bulkPut([
                {
                    type: 0,
                    value: 300.00,
                    createdAt: Date.now(),
                },
                {
                    type: 1,
                    value: 150.00,
                    createdAt: Date.now(),
                },
            ])
        })
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