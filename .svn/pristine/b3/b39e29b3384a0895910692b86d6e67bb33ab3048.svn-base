import axios from 'axios';

export default class serverApi {
    static async getHomeworkPaper(exam_id, qsIds) {
        let token = await global.storage.load({key: 'token'})
        let url = global.API_HOST + '/v2/student/homework/detail?exam_id=' + exam_id + '&token=' + token
        if (typeof qsIds === "object" && qsIds.hasOwnProperty('length') && qsIds.length > 0){
            url += "&qs_ids=" + qsIds.join(",")
        }
        let response = await fetch(url)
        return response.json();
        //return axios.get(global.API_HOST + '/v2/student/homework/detail',{params: {exam_id: exam_id}})
    }
    static async getExercisePaper(exam_id) {
        let token = await global.storage.load({key: 'token'})
        let response = await fetch(global.API_HOST + '/v2/student/exercise/detail?exam_id=' + exam_id + '&token=' + token)
        return response.json();
        //return axios.get(global.API_HOST + '/v2/student/exercise/detail',{params: {exam_id: exam_id}})
    }
}
