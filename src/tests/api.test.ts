import request from 'supertest';
import { server } from '../index';

describe('CRUD API Tests', () => {
  let createdUserId: string;

  afterAll(() => server.close());

  it('GET /api/users - should return an empty array initially', async () => {
    const res = await request(server).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/users - should create a new user', async () => {
    const newUserMock = {
      username: 'Masha',
      age: 30,
      hobbies: ['jogging', 'reading'],
    };

    const res = await request(server)
      .post('/api/users')
      .send(newUserMock);

    expect(res.status).toBe(201);
    expect(res.body.username).toBe(newUserMock.username);
    expect(res.body.age).toBe(newUserMock.age);
    expect(res.body.hobbies).toEqual(newUserMock.hobbies);
    expect(res.body).toHaveProperty('id');

    createdUserId = res.body.id;
  });

  it('GET /api/users/:userId - should return the created user', async () => {
    const res = await request(server).get(`/api/users/${ createdUserId }`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
    expect(res.body.username).toBe('Masha');
  });

  it('PUT /api/users/:userId - should update the created user', async () => {
    const updatedUserMock = {
      username: 'Maria',
      age: 35,
      hobbies: ['drawing'],
    };

    const res = await request(server)
      .put(`/api/users/${ createdUserId }`)
      .send(updatedUserMock);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
    expect(res.body.username).toBe(updatedUserMock.username);
    expect(res.body.age).toBe(updatedUserMock.age);
    expect(res.body.hobbies).toEqual(updatedUserMock.hobbies);
  });

  it('DELETE /api/users/:userId - should delete the created user', async () => {
    const res = await request(server).delete(`/api/users/${ createdUserId }`);

    expect(res.status).toBe(204);
  });

  it('GET /api/users/:userId - should return 404 for deleted user', async () => {
    const res = await request(server).get(`/api/users/${ createdUserId }`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
});
