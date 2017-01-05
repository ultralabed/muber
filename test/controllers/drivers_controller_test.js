import assert from 'assert';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';

const Driver = mongoose.model('driver');

describe('Drivers controller', () => {
  it('Post to /api/drivers creates a new driver', (done) => {
   Driver.count()
    .then(count => {
      request(app)
        .post('/api/drivers')
        .send({
          email: 'test@test.com',
        })
        .end((err, response) => {
          Driver.count().then(newCount => {
            assert(count + 1 === newCount);
            done();
          });
        });
    });
  });

  it('Put to /api/drivers/:id update a new driver', (done) => {
   const driver = new Driver({ email: 'testDriving@test.com', driving: false});
   driver.save()
    .then(() => {
      request(app)
        .put(`/api/drivers/${driver._id}`)
        .send({ driving: true })
        .end((err, response) => {
          Driver.findOne({ email: 'testDriving@test.com' })
            .then(driver => {
              assert(driver.driving === true);
              done();
            });
        });
    });
  });

  it('Delete /api/drivers/:id delete a driver', (done) => {
   const driver = new Driver({ email: 'testDelete@test.com', driving: false});
   driver.save()
    .then(() => {
      request(app)
        .delete(`/api/drivers/${driver._id}`)
        .end((err, response) => {
          Driver.findOne({ email: 'testDelete@test.com' })
            .then(driver => {
              assert(driver === null);
              done();
            });
        });
    });
  });

  it('Delete /api/drivers/:id delete a driver', (done) => {
    const seattleDriver = new Driver({
      email: 'seattle@test.com',
      driving: true,
      geomtery: {
        type: 'Point',
        coordinates: [-122.4759902, 47.6147628]
      },
    });
    const miamiDriver = new Driver({
      email: 'miami@test.com',
      driving: true,
      geometry: {
        type: 'Point',
        coordinates: [-80.253, 25.791]
      },
    });

    Promise.all([ seattleDriver.save(), miamiDriver.save() ])
      .then(() => {
        request(app)
          .get('/api/drivers?lng=-80&lat=25')
          .end((err, response) => {
            assert(response.body.length === 1);
            assert(response.body[0].obj.email === 'miami@test.com');
            done();
          });

      });
  });
});
