import { Partner, Countdown, Memory, Note, BucketListItem, LoveJarWish, Milestone } from '../types';

const API_BASE = '/api';

export const api = {
  // Partners
  async getPartners(): Promise<Partner[]> {
    const res = await fetch(`${API_BASE}/partners`);
    return res.json();
  },
  async updatePartner(id: string, data: Partial<Partner>): Promise<Partner> {
    const res = await fetch(`${API_BASE}/partners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async sendPoke(targetId: string, senderId: string, pokeType: 'kiss' | 'hug' | 'poke' | 'miss_you', message?: string) {
    const res = await fetch(`${API_BASE}/partners/${targetId}/poke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, pokeType, message })
    });
    return res.json();
  },

  // Countdowns
  async getCountdowns(): Promise<Countdown[]> {
    const res = await fetch(`${API_BASE}/countdowns`);
    return res.json();
  },
  async createCountdown(data: Partial<Countdown>): Promise<Countdown> {
    const res = await fetch(`${API_BASE}/countdowns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteCountdown(id: string) {
    const res = await fetch(`${API_BASE}/countdowns/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Memories / Scrapbook
  async getMemories(chapter?: string): Promise<Memory[]> {
    const url = chapter && chapter !== 'All' ? `${API_BASE}/memories?chapter=${encodeURIComponent(chapter)}` : `${API_BASE}/memories`;
    const res = await fetch(url);
    return res.json();
  },
  async createMemory(data: Partial<Memory>): Promise<Memory> {
    const res = await fetch(`${API_BASE}/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async likeMemory(id: string): Promise<Memory> {
    const res = await fetch(`${API_BASE}/memories/${id}/like`, { method: 'POST' });
    return res.json();
  },
  async deleteMemory(id: string) {
    const res = await fetch(`${API_BASE}/memories/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Notes & Post-Its
  async getNotes(isPostIt?: boolean): Promise<Note[]> {
    const url = isPostIt !== undefined ? `${API_BASE}/notes?isPostIt=${isPostIt}` : `${API_BASE}/notes`;
    const res = await fetch(url);
    return res.json();
  },
  async createNote(data: Partial<Note>): Promise<Note> {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteNote(id: string) {
    const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Bucket List
  async getBucketList(): Promise<BucketListItem[]> {
    const res = await fetch(`${API_BASE}/bucketlist`);
    return res.json();
  },
  async createBucketItem(data: Partial<BucketListItem>): Promise<BucketListItem> {
    const res = await fetch(`${API_BASE}/bucketlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async toggleBucketItem(id: string): Promise<BucketListItem> {
    const res = await fetch(`${API_BASE}/bucketlist/${id}/toggle`, { method: 'PATCH' });
    return res.json();
  },
  async deleteBucketItem(id: string) {
    const res = await fetch(`${API_BASE}/bucketlist/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Love Jar
  async getRandomLoveJarWish(): Promise<LoveJarWish> {
    const res = await fetch(`${API_BASE}/lovejar/random`);
    return res.json();
  },
  async getLoveJarWishes(): Promise<LoveJarWish[]> {
    const res = await fetch(`${API_BASE}/lovejar`);
    return res.json();
  },
  async addLoveJarWish(data: { message: string; category: string; authorId: string }): Promise<LoveJarWish> {
    const res = await fetch(`${API_BASE}/lovejar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Milestones
  async getMilestones(): Promise<Milestone[]> {
    const res = await fetch(`${API_BASE}/milestones`);
    return res.json();
  },
  async createMilestone(data: Partial<Milestone>): Promise<Milestone> {
    const res = await fetch(`${API_BASE}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
