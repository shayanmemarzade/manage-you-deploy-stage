import { apiService } from '../services';
import { URL_GET_DOCUMENTS, URL_UPLOAD_DOCUMENT, URL_UPDATE_DOCUMENT } from '../endpoints';

export const documentApi = {
    /**
     * Uploads a document using FormData.
     * @param {FormData} data - The FormData object containing the file and other details.
     */
    uploadDocument: (data: FormData) =>
        apiService.postMultipart(URL_UPLOAD_DOCUMENT, data),

    updateDocument: (data: FormData) =>
        apiService.postMultipart(URL_UPDATE_DOCUMENT, data),

    /**
     * Fetches all documents.
     */
    getDocuments: () =>
        apiService.get(URL_GET_DOCUMENTS),
};
