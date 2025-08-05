const admin = require('firebase-admin');

class FirebaseStudyModeStorage {
  constructor() {
    this.db = admin.firestore();
    this.collection = 'studyModeContent';
  }

  async saveContent(uploadId, studyModeContent) {
    try {
      const docRef = this.db.collection(this.collection).doc(uploadId);
      await docRef.set({
        ...studyModeContent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`Study mode content saved to Firestore: ${uploadId}`);
      return true;
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      throw error;
    }
  }

  async getContent(uploadId) {
    try {
      const docRef = this.db.collection(this.collection).doc(uploadId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error retrieving from Firestore:', error);
      throw error;
    }
  }

  async listContentByTeacher(teacherId) {
    try {
      const snapshot = await this.db.collection(this.collection)
        .where('metadata.uploadedBy', '==', teacherId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const content = [];
      snapshot.forEach(doc => {
        content.push({ id: doc.id, ...doc.data() });
      });
      
      return content;
    } catch (error) {
      console.error('Error listing teacher content:', error);
      throw error;
    }
  }

  async listContentBySubject(subject) {
    try {
      const snapshot = await this.db.collection(this.collection)
        .where('subject', '==', subject)
        .orderBy('createdAt', 'desc')
        .get();
      
      const content = [];
      snapshot.forEach(doc => {
        content.push({ id: doc.id, ...doc.data() });
      });
      
      return content;
    } catch (error) {
      console.error('Error listing subject content:', error);
      throw error;
    }
  }

  async updateContentStatus(uploadId, status) {
    try {
      const docRef = this.db.collection(this.collection).doc(uploadId);
      await docRef.update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return true;
    } catch (error) {
      console.error('Error updating content status:', error);
      throw error;
    }
  }

  async deleteContent(uploadId) {
    try {
      const docRef = this.db.collection(this.collection).doc(uploadId);
      await docRef.delete();
      
      console.log(`Study mode content deleted: ${uploadId}`);
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  async searchContent(searchTerm) {
    try {
      // Simple text search - in production, consider using Algolia or similar
      const snapshot = await this.db.collection(this.collection).get();
      
      const results = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const searchText = `${data.subject} ${data.topic} ${data.questions.map(q => q.question).join(' ')}`.toLowerCase();
        
        if (searchText.includes(searchTerm.toLowerCase())) {
          results.push({ id: doc.id, ...data });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }

  async getContentStats() {
    try {
      const snapshot = await this.db.collection(this.collection).get();
      
      const stats = {
        totalContent: 0,
        totalQuestions: 0,
        subjects: {},
        questionTypes: {},
        uploadedBy: {},
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        stats.totalContent++;
        stats.totalQuestions += data.questions.length;
        
        // Subject stats
        stats.subjects[data.subject] = (stats.subjects[data.subject] || 0) + 1;
        
        // Question type stats
        data.questions.forEach(q => {
          stats.questionTypes[q.type] = (stats.questionTypes[q.type] || 0) + 1;
        });
        
        // Uploader stats
        const uploader = data.metadata.uploadedBy;
        stats.uploadedBy[uploader] = (stats.uploadedBy[uploader] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting content stats:', error);
      throw error;
    }
  }
}

module.exports = { FirebaseStudyModeStorage };