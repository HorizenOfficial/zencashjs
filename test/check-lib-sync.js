const expect = require('chai').expect
const { exec, execSync } = require('child_process')

const makeTmpChange = dir => execSync(`touch ${dir}/tmp.js && git add --intent-to-add ${dir}/tmp.js`)
const resetTmpChange = dir => execSync(`git reset ${dir}/tmp.js && rm ${dir}/tmp.js`)

it('runs successfully when there are no changes between the current and main branches', done => {
    exec('./scripts/check-lib-sync.sh', error => {
        expect(error).to.equal(null)
        done()
    })
})

it('runs successfully when ./lib is in sync with ./src', done => {
    ['src', 'lib'].forEach(dir => makeTmpChange(dir))
    exec('./scripts/check-lib-sync.sh', error => {
        ['src', 'lib'].forEach(dir => resetTmpChange(dir))
        expect(error).to.equal(null)
        done()
    })
})

it('errors when ./lib is not in sync with ./src', done => {
    makeTmpChange('src')
    exec('./scripts/check-lib-sync.sh', error => {
        resetTmpChange('src')
        expect(error).to.be.an('Error')
        done()
    })
})
