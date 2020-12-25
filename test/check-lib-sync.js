const expect = require('chai').expect
const { exec, execSync } = require('child_process')

describe('scripts/check-lib-sync.sh', () => {
    if (process.platform === 'win32') {
        return it('is not meant to be run on Windows', () => {
            expect(process.platform).to.equal('win32')
        })
    }

    const addTemporaryChange = dir => execSync(`touch ${dir}/tmp.js && git add --intent-to-add ${dir}/tmp.js`)
    const revertTemporaryChange = dir => execSync(`git reset ${dir}/tmp.js && rm ${dir}/tmp.js`)

    it('runs successfully when there are no changes', done => {
        exec('scripts/check-lib-sync.sh', error => {
            expect(error).to.equal(null)
            done()
        })
    })

    it('runs successfully when changes in ./lib are in sync with ./src', done => {
        const dirs = ['src', 'lib']
        dirs.forEach(dir => addTemporaryChange(dir))
        exec('scripts/check-lib-sync.sh', error => {
            dirs.forEach(dir => revertTemporaryChange(dir))
            expect(error).to.equal(null)
            done()
        })
    })

    it('errors when changes in ./lib are not in sync with ./src', done => {
        addTemporaryChange('src')
        exec('scripts/check-lib-sync.sh', error => {
            revertTemporaryChange('src')
            expect(error).to.be.an('Error')
            done()
        })
    })
})
