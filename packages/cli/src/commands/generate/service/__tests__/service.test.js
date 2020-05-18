global.__dirname = __dirname

import { loadGeneratorFixture } from 'src/lib/test'

import * as service from '../service'

jest.mock('../../../../lib', () => {
  const path = require('path')
  const lib = jest.requireActual('../../../../lib')
  return {
    ...lib,
    prettierOptions: () => {
      return require(path.resolve(
        global.__dirname +
          '../../../../../lib/__tests__/fixtures/prettier.config.js'
      ))
    },
  }
})

const extensionForBaseArgs = (baseArgs) =>
  baseArgs && baseArgs.typescript ? 'ts' : 'js'

const itReturnsExactly2Files = (baseArgs) => {
  test('returns exactly 2 files', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'User',
      crud: false,
      relations: [],
    })

    expect(Object.keys(files).length).toEqual(2)
  })
}
const itCreatesASingleWordServiceFile = (baseArgs) => {
  test('creates a single word service file', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'User',
      crud: false,
      relations: [],
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[`/path/to/project/api/src/services/users/users.${extension}`]
    ).toEqual(loadGeneratorFixture('service', `singleWord.${extension}`))
  })
}
const itCreatesASingleWordServiceTestFile = (baseArgs) => {
  test('creates a single word service test file', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'User',
      crud: false,
      relations: null,
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[`/path/to/project/api/src/services/users/users.test.${extension}`]
    ).toEqual(loadGeneratorFixture('service', `singleWord.test.${extension}`))
  })
}

const itCreatesAMultiWordServiceFile = (baseArgs) => {
  test('creates a multi word service file', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'UserProfile',
      crud: false,
      relations: null,
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[
        `/path/to/project/api/src/services/userProfiles/userProfiles.${extension}`
      ]
    ).toEqual(loadGeneratorFixture('service', `multiWord.${extension}`))
  })
}

const itCreatesAMultiWordServiceTestFile = (baseArgs) => {
  test('creates a multi word service test file', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'UserProfile',
      crud: false,
      relations: null,
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[
        `/path/to/project/api/src/services/userProfiles/userProfiles.test.${extension}`
      ]
    ).toEqual(loadGeneratorFixture('service', `multiWord.test.${extension}`))
  })
}

const itCreatesASingleWordServiceFileWithCRUDActions = (baseArgs) => {
  test('creates a single word service file with CRUD actions', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'Post',
      crud: true,
      relations: null,
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[`/path/to/project/api/src/services/posts/posts.${extension}`]
    ).toEqual(loadGeneratorFixture('service', `singleWord_crud.${extension}`))
  })
}

const itCreatesASingleWordServiceTestFileWithCRUDActions = (baseArgs) => {
  test('creates a service test file with CRUD actions', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'Post',
      crud: true,
      relations: null,
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[`/path/to/project/api/src/services/posts/posts.test.${extension}`]
    ).toEqual(
      loadGeneratorFixture('service', `singleWord_crud.test.${extension}`)
    )
  })
}

const itCreatesAMultiWordServiceFileWithCRUDActions = (baseArgs) => {
  test('creates a multi word service file with CRUD actions', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'UserProfile',
      crud: true,
      relations: null,
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[
        `/path/to/project/api/src/services/userProfiles/userProfiles.${extension}`
      ]
    ).toEqual(loadGeneratorFixture('service', `multiWord_crud.${extension}`))
  })
}
const itCreatesAMultiWordServiceTestFileWithCRUDActions = (baseArgs) => {
  test('creates a multi word service test file with CRUD actions', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'UserProfile',
      crud: true,
      relations: null,
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[
        `/path/to/project/api/src/services/userProfiles/userProfiles.test.${extension}`
      ]
    ).toEqual(
      loadGeneratorFixture('service', `multiWord_crud.test.${extension}`)
    )
  })
}

const itCreatesASingleWordServiceFileWithAHasManyRelation = (baseArgs) => {
  test('creates a single word service file with a hasMany relation', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'User',
      crud: false,
      relations: ['userProfiles'],
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[`/path/to/project/api/src/services/users/users.${extension}`]
    ).toEqual(
      loadGeneratorFixture('service', `singleWord_hasMany.${extension}`)
    )
  })
}

const itCreatesASingleWordServiceFileWithABelongsToRelation = (baseArgs) => {
  test('creates a single word service file with a belongsTo relation', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'User',
      crud: false,
      relations: ['identity'],
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[`/path/to/project/api/src/services/users/users.${extension}`]
    ).toEqual(
      loadGeneratorFixture('service', `singleWord_belongsTo.${extension}`)
    )
  })
}

const itCreatesASingleWordServiceFileWithMultipleRelations = (baseArgs) => {
  test('creates a single word service file with multiple relations', async () => {
    const files = await service.files({
      ...baseArgs,
      name: 'User',
      crud: false,
      relations: ['userProfiles', 'identity'],
    })
    const extension = extensionForBaseArgs(baseArgs)

    expect(
      files[`/path/to/project/api/src/services/users/users.${extension}`]
    ).toEqual(
      loadGeneratorFixture('service', `singleWord_multiple.${extension}`)
    )
  })
}

describe('in javascript mode', () => {
  itReturnsExactly2Files()
  itCreatesASingleWordServiceFile()
  itCreatesASingleWordServiceTestFile()
  itCreatesAMultiWordServiceFile()
  itCreatesAMultiWordServiceTestFile()
  itCreatesASingleWordServiceFileWithCRUDActions()
  itCreatesASingleWordServiceTestFileWithCRUDActions()
  itCreatesAMultiWordServiceFileWithCRUDActions()
  itCreatesAMultiWordServiceTestFileWithCRUDActions()
  itCreatesASingleWordServiceFileWithAHasManyRelation()
  itCreatesASingleWordServiceFileWithABelongsToRelation()
  itCreatesASingleWordServiceFileWithMultipleRelations()
})

describe('in typescript mode', () => {
  const baseArgs = { typescript: true }

  itReturnsExactly2Files(baseArgs)
  itCreatesASingleWordServiceFile(baseArgs)
  itCreatesASingleWordServiceTestFile(baseArgs)
  itCreatesAMultiWordServiceFile(baseArgs)
  itCreatesAMultiWordServiceTestFile(baseArgs)
  itCreatesASingleWordServiceFileWithCRUDActions(baseArgs)
  itCreatesASingleWordServiceTestFileWithCRUDActions(baseArgs)
  itCreatesAMultiWordServiceFileWithCRUDActions(baseArgs)
  itCreatesAMultiWordServiceTestFileWithCRUDActions(baseArgs)
  itCreatesASingleWordServiceFileWithAHasManyRelation(baseArgs)
  itCreatesASingleWordServiceFileWithABelongsToRelation(baseArgs)
  itCreatesASingleWordServiceFileWithMultipleRelations(baseArgs)
})
