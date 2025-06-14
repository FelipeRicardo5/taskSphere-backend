import axios from 'axios';
import User from '../models/User';

export class CollaboratorService {
  static async getSuggestedCollaborators(limit: number = 5) {
    try {
      // Fetch random users from the API
      const response = await axios.get(`https://randomuser.me/api/?results=${limit}`);
      const randomUsers = response.data.results;

      // Transform the data to match our user format
      const suggestions = randomUsers.map((user: any) => ({
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        avatar: user.picture.medium
      }));

      // Check which emails already exist in our database
      const existingEmails = await User.find({
        email: { $in: suggestions.map((s: any) => s.email) }
      }).select('email');

      // Filter out existing users
      const filteredSuggestions = suggestions.filter(
        (suggestion: any) => !existingEmails.some((user) => user.email === suggestion.email)
      );

      return filteredSuggestions;
    } catch (error) {
      throw new Error('Failed to fetch suggested collaborators');
    }
  }
} 