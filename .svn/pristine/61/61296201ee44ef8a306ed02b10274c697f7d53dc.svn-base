export default class examAttendStorage {
    static async getExamAttendInfo(exam_attend_id){
        try {
            return await storage.load({key: EXAM_ATTEND_INFO, id: exam_attend_id})
        }catch (e) {
            return {}
        }
    }
    static async saveExamAttendInfo(exam_attend_id, data){
        let attend_info = await this.getExamAttendInfo(exam_attend_id)
        return storage.save({
            key: EXAM_ATTEND_INFO,
            id: exam_attend_id,
            data: Object.assign(attend_info, data)
        })

    }

    static removeExamAttendInfo(exam_attend_id){
        return storage.remove({key: EXAM_ATTEND_INFO, id: exam_attend_id})
    }


    static async getExamAttendAnswer(exam_attend_id, item_id){
        try {
            return await storage.load({
                key: EXAM_ATTEND_ITEM_ANSWER + "-" + exam_attend_id,
                id: exam_attend_id
            })
        }catch (e) {
            return {}
        }
    }

    static async saveExamAttendAnswer(exam_attend_id, item_id, data){
        let answer = await this.getExamAttendAnswer(exam_attend_id, item_id)
        return storage.save({
            key: EXAM_ATTEND_ITEM_ANSWER + "-" + exam_attend_id,
            id: item_id,
            data: Object.assign(answer, data)
        })
    }

    static async getExamAttendAllAnswer(exam_attend_id){
        try {
            return await storage.getAllDataForKey(EXAM_ATTEND_ITEM_ANSWER + "-" + exam_attend_id)
        }catch (e) {
            return []
        }
    }

    static async getExamAttendAnswerNum(exam_attend_id){
        try {
            let keys = await storage.getIdsForKey(EXAM_ATTEND_ITEM_ANSWER + "-" + exam_attend_id)
            return keys.length
        }catch (e) {
            return 0
        }
    }

    static async getExamAttendScoredAnswerNum(exam_attend_id){
        try {
            let items = await storage.getAllDataForKey(EXAM_ATTEND_ITEM_ANSWER + "-" + exam_attend_id)
            let num = 0
            for (let i in items){
                if (+items[i].score_status === 1){
                    num ++;
                }
            }
            return num
        }catch (e) {
            return 0
        }
    }

    static removeExamAttendAnswer(exam_attend_id){
        return storage.clearMapForKey(EXAM_ATTEND_ITEM_ANSWER+ "-" + exam_attend_id)
    }

    static async checkScoreFinish(exam_attend_id){
        let score_num = await this.getExamAttendScoredAnswerNum(exam_attend_id)
        let answer_num = await this.getExamAttendAnswerNum(exam_attend_id)
        return score_num === answer_num
    }

    static async checkAnswerFinish(exam_attend_id){
        let attend_info = await this.getExamAttendInfo(exam_attend_id)
        if (attend_info.hasOwnProperty('item_num')) {
            let answer_num = await this.getExamAttendAnswerNum(exam_attend_id)
            return answer_num === +attend_info.item_num
        }
        return false
    }

}