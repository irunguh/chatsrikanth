<table>
  <tbody>
    <tr>
      <th>Id:</th>
      <td><?php echo $user->getId() ?></td>
    </tr>
    <tr>
      <th>User:</th>
      <td><?php echo $user->getUserId() ?></td>
    </tr>
    <tr>
      <th>User name:</th>
      <td><?php echo $user->getUserName() ?></td>
    </tr>
    <tr>
      <th>Is online:</th>
      <td><?php echo $user->getIsOnline() ?></td>
    </tr>
  </tbody>
</table>

<hr />

<a href="<?php echo url_for('chat/edit?id='.$user->getId()) ?>">Edit</a>
&nbsp;
<a href="<?php echo url_for('chat/index') ?>">List</a>
